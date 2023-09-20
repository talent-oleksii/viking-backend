// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const { createClient } = require("@supabase/supabase-js");
// const Replicate = require("replicate");

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";
import { Headers } from "node-fetch";
import fetch from "node-fetch";
import cors from "cors"; // Import the 'cors' middleware
import * as dotenv from "dotenv";
import Stripe from "stripe";
import { Resend } from "resend";

dotenv.config();
global.fetch = fetch;
global.Headers = Headers;

const app = express();
const port = 3000;

const resend = new Resend("re_TSLCdoxm_2C6GFXZMpvEv1BhNSPqYsKTv");

const stripe = new Stripe(
  "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"
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize Supabase client
const supabaseUrl = "https://remwbrfkzindyqlksvyv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbXdicmZremluZHlxbGtzdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQxMzk3NzAsImV4cCI6MjAwOTcxNTc3MH0.5ERbhDU3OAtrLPThLoiAudTzmnIZ3rR1NRPT2M7hkr4";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware for parsing JSON and urlencoded form data
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Set max request size to 200MB
app.use(bodyParser.json({ limit: "400mb" }));
app.use(bodyParser.urlencoded({ limit: "400mb", extended: true }));

// Enable CORS for all routes using the 'cors' middleware
app.use(cors());

// Old Lemon
app.post("/webhook", async (req, res) => {
  console.log("Received webhook:", req.body);

  const databody = req.body;
  const status = databody.data.attributes.status;
  const email = databody.data.attributes.user_email;
  const amount = databody.data.attributes.subtotal;
  console.log("Status: ", status);
  console.log("Email: ", email);
  console.log("Amount: ", amount);

  const emailPrefix = email.split("@")[0];
  console.log("Email prefix: ", emailPrefix);

  if (status === "paid") {
    console.log("Status is paid");

    // Read entire row with the matching email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    console.log("Data: ", data);
    console.log("Error: ", error);

    // Assuming there's only one matching row, else you can loop through 'fetchedData'
    const rowData = data[0];
    console.log("Row data: ", rowData);

    const mom = rowData.mom;
    const dad = rowData.dad;

    console.log("Mom: ", mom);
    console.log("Dad: ", dad);

    // Update the 'is_active' column
    const { data1, error1 } = await supabase
      .from("users")
      .update({ paid: true })
      .eq("email", email);

    console.log("Data1: ", data1);
    console.log("Error1: ", error1);

    // Determine loop count
    let loopCount = 0;
    if (amount === 900) {
      loopCount = 1;
    } else {
      loopCount = 5;
    }

    res.status(200).send("API triggered");

    // Make API call (boy)
    for (let i = 1; i <= loopCount; i++) {
      const randomFactor = Math.floor(Math.random() * 100) + 1; // A random number between 1 and 100
      const newSeed = 20000 + i * 10 + randomFactor; // Original seed + random factor

      const response = await replicate.run(
        "catacolabs/baby-pics:2c228c4d2266c2a03fee359e7d1dd7cb20838e9d68500d18749e4213f6c6b97d",
        {
          input: {
            image: mom,
            image2: dad,
            gender: "boy",
            seed: newSeed,
          },
        }
      );

      console.log("Response: ", response);

      const { data, error } = await supabase
        .from("users")
        .update({ [`image${i}`]: response })
        .eq("email", email);

      console.log("Data: ", data);
      console.log("Error: ", error);
    }

    // Make API call (girl)
    for (let i = 1; i <= loopCount; i++) {
      const randomFactor = Math.floor(Math.random() * 100) + 1; // A random number between 1 and 100
      const newSeed = 20000 + i * 10 + randomFactor; // Original seed + random factor

      const response = await replicate.run(
        "catacolabs/baby-pics:2c228c4d2266c2a03fee359e7d1dd7cb20838e9d68500d18749e4213f6c6b97d",
        {
          input: {
            image: mom,
            image2: dad,
            gender: "girl",
            seed: newSeed,
          },
        }
      );

      console.log("Response: ", response);

      const { data, error } = await supabase
        .from("users")
        .update({ [`image${i + 5}`]: response })
        .eq("email", email);

      console.log("Data: ", data);
      console.log("Error: ", error);
    }
  } else {
    // Handle other cases
    res.status(200).send("NOT OK");
  }
});

// Replicate webhook
app.post("/replicate", async (req, res) => {
  console.log("Received webhook:", req.body);
  console.log("Training_ID: ", req.body.id);
  console.log("Model_ID: ", req.body.output.version);

  const training_id = req.body.id;
  const model_id = req.body.output.version;

  // // Read order row with the matching training_id
  // const { data, error } = await supabase
  //   .from("users")
  //   .select("order")
  //   .eq("training_id", training_id);

  // console.log("Data: ", data);
  // console.log("Error: ", error);

  // Read entire row with the matching training_id
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("training_id", training_id);

  console.log("Data: ", data);
  console.log("Error: ", error);

  // Declare partial email
  const partial = data[0].partial;
  console.log("Partial: ", partial);

  // Declare sex
  const sex = data[0].sex;
  console.log("Sex: ", sex);

  // Declare order_type
  const order_type = data[0].order;
  console.log("Order type 1: ", order_type);
  console.log("Order type 2: ", data[0].order);

  // Determine loop count
  let loopCount = 0;
  if (order_type === "8") {
    loopCount = 2;
  } else {
    loopCount = 20;
  }
  console.log("Loop count: ", loopCount);

  // Send status
  res.status(200).send("API triggered");

  // // Prompts
  // let new_prompt = [
  //   "fighting in battle",
  //   "fighting on a ship",
  //   "fighting next to flames",
  //   "navigating the seas",
  //   "baking a cake",
  //   "on a date",
  //   "playing the piano",
  //   "at a party",
  //   "at the beach",
  //   "cooking dinner",
  //   "flying a plane",
  //   "riding a horse",
  //   "going to the gym",
  //   "in the kitchen",
  //   "playing the guitar",
  //   "hiking in the mountains",
  //   "building a house",
  //   "running a marathon",
  //   "in the garden",
  //   "having a picnic",
  //   "playing tennis",
  // ];

  // Prompts
  let man_prompt = [
    "A photo of TOK fierce Viking warrior man, full body shot, standing on an epic wooden viking boat, holding a viking axe in the sky, wearing fur viking clothes with traditional viking armor, looking out to sea, with a beard, bright energized eyes, other vikings are on the boat, blurred in the background",
    "A photo of TOK fierce Viking warrior man, full body shot, standing on an epic wooden viking boat, holding a viking axe in the sky, wearing fur viking clothes with traditional viking armor, looking out to sea, with a beard, bright energized eyes, other vikings are on the boat, blurred in the background",
    "A photo of TOK fierce Viking warrior man, full body shot, standing on an epic wooden viking boat, in a raging dark storm at night, dark lighting, shadows, wet hair, wet skin, lightning in the sky, smile on his face",
    "A photo of TOK Scandinavian Viking man, from the waist up, playing a viking horn around the fire, the firelight illuminates his face, casting shadows on the other side of his face, his eyes are closed, focusing on the music, this picture is outside under a starry sky",
    "A photo of TOK fierce Viking warrior man, full body shot, standing in a battle-torn village, swinging a sword in one hand, a shield in the other, with a wild look in his eyes, yelling in combat, scars on his face, blood on his shoulder, wearing viking armor, super realistic, high quality hd, facing the camera,",
    "A photo of TOK fierce Viking king, full body shot, sitting on a stone viking thrown, holding a viking spear, wearing traditional viking king clothing, emotionless, eyes looking ahead, in a room of viking townsmen. The foreground is blurred where the other vikings are. The room is dimly lit with candle light",
    "A photo of TOK Scandinavian man, full body shot, standing in the northern woods at night, there are glowing runes around him, he is holding a rune in his hand, a curious look on his face, he is looking up at the sky",
    "A photo of TOK viking man, looking at a wooden board game, laughing with his friends, high quality, hd, super realistic, in the forest surrounded by pitched tents",
    "A photo of TOK fierce Viking warrior man, sitting at a table at a grand feast with other vikings, they are laughing and singing, lit by candle light, eating meats and bread, hyper-realistic, photo-realistic",
    "A photo of TOK fierce Viking hunter man, half body shot, standing in a rocky coastline, pulling back on a bow and arrow, focusing on his shot, one eye closed, scars on his face, wearing fir skins, muscle definition",
    "A photo of TOK fierce Viking warrior man, full body shot, standing over the slain body of a dragon, sword in hand, flaming torch in the other, looking at his back, with the dragon in front of him,",
    "A photo of TOK a viking father, surrounded by his family, the kids are playing with wooden swords, in an ancient viking house, lit by candles, the focus is on the father",
    "A photo of TOK a viking man in a tent filled with maps and war plans, wearing armor, looking down at a map, wearing an axe, shield and holding a spear in one hand, with a fir cape",
    "A photo of TOK fierce Viking warrior man in heat of battle, blocking arrows with his shield, in burning house, close-up, ultra-realistic, sweat running down his face, wearing a horned viking helmet",
    "A photo of TOK Viking warrior man dead after battle, with his glowing soul being carried up to clouds by a valkyrie angel at night, moon in the sky, in the Scandinavian north by a lake",
    "A photo of TOK Viking man, a close-up of him forging a sword from hot metal, Close up, blurred background, super realistic, photo-realistic, bald head, beard, lit by the glow of the weapon and reflection of the light, super realistic, hyper realistic, sweat going down his face",
    "A photo of TOK Viking man, walking through a Viking town looking at the shops. There is fruit, and wooden bracelets and swords for sale. Close up, blurred background, super realistic, photo-realistic, perspective of looking over his shoulder, long flowing hair, beard",
    "A photo of TOK Viking man, full body shot, walking in a snow-covered forest, wearing traditional winter Viking clothes, holding a hawk in his gloved hand, wearing a viking backpack with supplied and weapons, super realistic, hyper-realistic, photo-realistic,",
    "A photo of TOK Viking warrior man, a full body shot of him walking next to a giant wolf, in winter forest, it's snowing, looking ahead with determination, snow on clothes, feet are deep in snow, super realistic, hyper-realistic, photo-realistic, dramatic lightning, deep blacks, max detail, realistic shadows,",
    "A photo of TOK Viking warrior man, a long view of him kneeling in the snow by a lake, mourning over a grave super realistic, hyper-realistic, photo-realistic, dramatic lightning, deep blacks, max detail, realistic shadows,epic,dramatic lighting",
    "A photo of TOK Viking warrior man, at a viking wedding, guests are blurred in the background, traditional Viking wedding clothes, super realistic, hyper-realistic, photo-realistic, dramatic lightning, deep blacks, max detail, realistic shadows,epic, dramatic lighting, ring exchange with norse symbols, close-up",
  ];

  let woman_prompt = [
    "A photo of TOK fierce Viking warrior woman, full body shot, standing on an epic wooden Viking boat, holding a Viking axe in the sky, looking out to sea, wearing fur Viking clothes with traditional Viking armor, bright energized eyes, braided hair, other Vikings are on the boat, blurred in the background",
    "A photo of TOK fierce Viking warrior woman, full body shot, standing on an epic wooden Viking boat, holding a Viking axe in the sky, looking out to sea, wearing fur Viking clothes with traditional Viking armor, bright energized eyes, braided hair, other Vikings are on the boat, blurred in the background",
    "A photo of TOK fierce Viking warrior woman, full body shot, standing on an epic wooden Viking boat, in a raging dark storm at night, dark lighting, shadows, wet braided hair, wet skin, lightning in the sky, smile on her face",
    "A photo of TOK Scandinavian Viking woman, from the waist up, playing a Viking horn around the fire, the firelight illuminates her face, casting shadows on the other side of her face, her eyes are closed, focusing on the music, braided hair, this picture is outside under a starry sky",
    "A photo of TOK fierce Viking warrior woman, full body shot, standing in a battle-torn village, swinging a sword in one hand, a shield in the other, with a wild look in her eyes, yelling in combat, scars on her face, blood on her shoulder, wearing Viking armor, super realistic, high quality HD, facing the camera",
    "A photo of TOK fierce Viking queen, full body shot, sitting on a stone Viking throne, holding a Viking spear, wearing traditional Viking queen clothing, emotionless, eyes looking ahead, braided hair, in a room of Viking townsmen. The foreground is blurred where the other Vikings are. The room is dimly lit with candlelight",
    "A photo of TOK Scandinavian woman, full body shot, standing in the northern woods at night, there are glowing runes around her, she is holding a rune in her hand, a curious look on her face, braided hair, she is looking up at the sky",
    "A photo of TOK Viking woman, looking at a wooden board game, laughing with her friends, high quality, HD, super realistic, in the forest surrounded by pitched tents, braided hair",
    "A photo of TOK fierce Viking warrior woman, sitting at a table at a grand feast with other Vikings, they are laughing and singing, lit by candlelight, eating meats and bread, braided hair, hyper-realistic, photo-realistic",
    "A photo of TOK fierce Viking hunter woman, half body shot, standing on a rocky coastline, pulling back on a bow and arrow, focusing on her shot, one eye closed, scars on her face, wearing fur skins, muscle definition, braided hair",
    "A photo of TOK fierce Viking warrior woman, full body shot, standing over the slain body of a dragon, sword in hand, flaming torch in the other, looking at her back, with the dragon in front of her, braided hair",
    "A photo of TOK a Viking mother, surrounded by her family, the kids are playing with wooden swords, in an ancient Viking house, lit by candles, braided hair, the focus is on the mother",
    "A photo of TOK Viking woman in a tent filled with maps and war plans, wearing armor, looking down at a map, wearing an axe, shield and holding a spear in one hand, with a fur cape, braided hair",
    "A photo of TOK fierce Viking warrior woman in the heat of battle, blocking arrows with her shield, in a burning house, close-up, ultra-realistic, sweat running down her face, wearing a horned Viking helmet, braided hair",
    "A photo of TOK Viking warrior woman dead after battle, with her glowing soul being carried up to clouds by a Valkyrie angel at night, moon in the sky, in the Scandinavian north by a lake, braided hair",
    "A photo of TOK Viking woman, a close-up of her forging a sword from hot metal, Close up, blurred background, super realistic, photo-realistic, bald head, lit by the glow of the weapon and reflection of the light, super realistic, hyper-realistic, sweat going down her face, braided hair",
    "A photo of TOK Viking woman, walking through a Viking town looking at the shops. There is fruit, and wooden bracelets and swords for sale. Close up, blurred background, super realistic, photo-realistic, perspective of looking over her shoulder, long flowing braided hair",
    "A photo of TOK Viking woman, full body shot, walking in a snow-covered forest, wearing traditional winter Viking clothes, holding a hawk in her gloved hand, wearing a Viking backpack with supplies and weapons, super realistic, hyper-realistic, photo-realistic, braided hair",
    "A photo of TOK Viking warrior woman, a full body shot of her walking next to a giant wolf, in a winter forest, it's snowing, looking ahead with determination, snow on clothes, feet are deep in snow, super realistic, hyper-realistic, photo-realistic, dramatic lighting, deep blacks, max detail, realistic shadows, braided hair",
    "A photo of TOK Viking warrior woman, a long view of her kneeling in the snow by a lake, mourning over a grave, super realistic, hyper-realistic, photo-realistic, dramatic lighting, deep blacks, max detail, realistic shadows, epic, dramatic lighting, braided hair",
    "A photo of TOK Viking warrior woman, at a Viking wedding, guests are blurred in the background, traditional Viking wedding clothes, super realistic, hyper-realistic, photo-realistic, dramatic lighting, deep blacks, max detail, realistic shadows, epic, dramatic lighting, ring exchange with Norse symbols, close-up, braided hair",
  ];

  // Determine the appropriate prompt array based on the value of "sex"
  let selected_prompt = sex === "man" ? man_prompt : woman_prompt;

  // prompt: `a photo of TOK wearing Viking armor while ${new_prompt[i]}`,

  // Trigger replicate
  for (let i = 1; i <= loopCount; i++) {
    const response = await replicate.run(model_id, {
      input: {
        prompt: selected_prompt[i], // Use the selected prompt
        negative_prompt:
          "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",
      },
    });

    console.log("Response: ", response);
    console.log(response);
    console.log(response[0]);

    // Download the image using fetch
    const fetchResponse = await fetch(response[0]);
    const buffer = await fetchResponse.buffer();

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("results")
      .upload(`${partial}${i}.png`, buffer, {
        cacheControl: "3600",
        upsert: true,
      });

    console.log("Data: ", data);
    console.log("Error: ", error);
    console.log("Done");

    // // Insert link into table
    // const { data, error } = await supabase
    //   .from("users")
    //   .update({ [`result${i}`]: response[0] })
    //   .eq("training_id", training_id);

    // console.log("Data: ", data);
    // console.log("Error: ", error);
  }
});

// Temp 
app.post("/trigger-training", async (req, res) => {
  const { email } = req.body;
  console.log("Email: ", email);

  // try {
  //   const training = await replicate.trainings.create(
  //     "stability-ai",
  //     "sdxl",
  //     "a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
  //     {
  //       destination: "stockbet/sdxl-viking",
  //       input: {
  //         input_images: `https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/${email}.zip`,
  //       },
  //       webhook: "https://viking-zh8k.onrender.com/replicate",
  //     }
  //   );
  //   console.log(`URL: https://replicate.com/p/${training.id}`);
  //   console.log(training);
  //   res.json({ success: true, trainingId: training.id }); // Added this line
  // } catch (error) {
  //   console.error("Error in training: ", error);
  //   res.status(500).json({ success: false, error: error.message }); // Added this line
  // }

  const training = await replicate.trainings.create(
    "stability-ai",
    "sdxl",
    "a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
    {
      destination: "matthewiversen333/aivking",
      input: {
        input_images: `https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/${email}.zip`,
      },
      webhook: "https://aivking.onrender.com/replicate",
    }
  );

  console.log(`URL: https://replicate.com/p/${training.id}`);
  console.log(training);
  res.json({ success: true, trainingId: training.id }); // Added this line

  // Update the 'training_id' column
  const { data, error } = await supabase
    .from("users")
    .update({ training_id: training.id })
    .eq("partial", email);

  console.log("Data: ", data);
  console.log("Error: ", error);
});

// Stripe webhook
app.post("/stripe", async (req, res) => {
  // Check event type
  console.log("Received webhook:", req.body);
  console.log("Webhook type:", req.body.type);

  // Extract customer ID from Stripe webhook data
  const customerId = req.body.data.object.customer;
  console.log("Customer ID: ", customerId);

  // Retrieve customer emil from Stripe
  const email = req.body.data.object.billing_details.email;
  console.log("Email: ", email);
  const emailPrefix = email.split("@")[0];
  console.log("Email prefix: ", emailPrefix);

  res.json({ received: true });

  const training = await replicate.trainings.create(
    "stability-ai",
    "sdxl",
    "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
    {
      destination: "matthewiversen333/aivking",
      input: {
        input_images: `https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/${emailPrefix}.zip`,
        is_lora: false,
        crop_based_on_salience: false,
        use_face_detection_instead: true,
      },
      webhook: "https://aivking.onrender.com/replicate",
    }
  );
  console.log(`URL: https://replicate.com/p/${training.id}`);
  console.log(training);

  // Update the 'training_id' and 'paid' columns
  const { data, error } = await supabase
    .from("users")
    .update({
      training_id: training.id,
      paid: true,
    })
    .eq("email", email);

  console.log("Data: ", data);
  console.log("Error: ", error);

  // After the for loop finishes, send an email
  try {
    const emailData = await resend.emails.send({
      from: "AI Viking <team@aiviking.com>", // Replace with your actual details
      to: [email], // Assuming data[0].email contains the user's email address
      subject: "View Your Photos",
      html: `<strong>Thanks for placing an order!</strong><br><br>
      <p>Your can view your photos at <a href="https://aiviking.com/${emailPrefix}">aiviking.com/${emailPrefix}</a>.</p>`,
    });
    console.log(emailData);
  } catch (emailError) {
    console.error(emailError);
  }
});

// Final
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
