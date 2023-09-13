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

const resend = new Resend("re_5zpzt8uu_2y1Y6cmkgQiGMZ7XpiKsZ7xU");

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
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

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

  // Prompts
  let new_prompt = [
    "fighting in battle",
    "fighting on a ship",
    "fighting next to flames",
    "navigating the seas",
    "baking a cake",
    "on a date",
    "playing the piano",
    "at a party",
    "at the beach",
    "cooking dinner",
    "flying a plane",
    "riding a horse",
    "going to the gym",
    "in the kitchen",
    "playing the guitar",
    "hiking in the mountains",
    "building a house",
    "running a marathon",
    "in the garden",
    "having a picnic",
    "playing tennis",
  ];

  // Trigger replicate
  for (let i = 1; i <= loopCount; i++) {
    const response = await replicate.run(model_id, {
      input: {
        prompt: `a photo of TOK wearing Viking armor while ${new_prompt[i]}`,
        refine: 'expert_ensemble_refiner',
        high_noise_frac: '0.9',
        lora_scale: '0.9',
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
      destination: "stockbet/sdxl-viking",
      input: {
        input_images: `https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/${email}.zip`,
      },
      webhook: "https://viking-zh8k.onrender.com/replicate",
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
    "a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
    {
      destination: "stockbet/sdxl-viking",
      input: {
        input_images: `https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/${emailPrefix}.zip`,
        use_face_detection_instead: True,
      },
      webhook: "https://viking-zh8k.onrender.com/replicate",
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
