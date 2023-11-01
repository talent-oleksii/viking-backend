import insightface
import cv2
import numpy as np
import os
import sys
import gdown
import matplotlib.pyplot as plt
from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image
from faceswap import swap_n_show, swap_n_show_same_img, swap_face_single,fine_face_swap

from flask import Flask, request, jsonify
from flask_cors import CORS

app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0, det_size=(640, 640))

os.makedirs("data", exist_ok=True)

model_url = 'https://drive.google.com/uc?id=1HvZ4MAtzlY74Dk4ASGIS9L6Rg5oZdqvu'
model_output_path = 'inswapper_128.onnx'
if not os.path.exists(model_output_path):
    gdown.download(model_url, model_output_path, quiet=False)

swapper = insightface.model_zoo.get_model('inswapper_128.onnx', download=False, download_zip=False)

# def swap_n_save_same_img (img1_fn, app, swapper, output_path):
#     img1 = cv2.imread(img1_fn)
#     faces = app.get(img1)
#     face1, face2 = faces[0], faces[1]

#     img1_ = swapper.get(img1_, face2, face1, paste_back=True)
#     cv2.imwrite(output_path, img1_)
#     return img1_

def swap_n_save (img1_fn, img2_fn, app, swapper, output_path1, output_path2):
    img1 = cv2.imread(img1_fn)
    img2 = cv2.imread(img2_fn)

    # print('faces:', app.get(img1))
    face1 = app.get(img1)[0]
    face2 = app.get(img2)[1]

    img1_ = img1.copy()
    img2_ = img2.copy()
    img1_ = swapper.get(img1_, face1, face2, paste_back=True)
    img2_ = swapper.get(img2_, face2, face1, paste_back=True)

    cv2.imwrite(output_path1, img1_)
    cv2.imwrite(output_path2, img2_)
    return img1_, img2_

# output_image1 = 'output_imag1.png'
# output_image2 = 'output_imag2.png'

# swap_n_save('IMG_1850.jpeg', 't1.png', app, swapper, output_image1, output_image2)

img1_fn = f"{sys.argv[1]}"
img2_fn = f"{sys.argv[2]}"

print('ddd:', img1_fn, img2_fn)
swap_face_single(img1_fn, img2_fn, app, swapper, enhance=True, enhancer='REAL-ESRGAN 2x',device="cpu")