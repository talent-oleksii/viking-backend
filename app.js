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

global.fetch = fetch;
global.Headers = Headers;

const app = express();
const port = 3000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize Supabase client
const supabaseUrl = "https://tghnhiheiaeenfaurxtp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaG5oaWhlaWFlZW5mYXVyeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM4MTg2NjIsImV4cCI6MjAwOTM5NDY2Mn0.PybFXf64fYa0aoZuUCe1DNZclu2Z9U44n5Ktv-nKB5g";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware for parsing JSON and urlencoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Your webhook endpoint
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
