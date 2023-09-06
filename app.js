const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

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

    // Update the 'is_active' column
    const { data1, error1 } = await supabase
      .from("users")
      .update({ paid: true })
      .eq("email", email);

    console.log("Data1: ", data1);
    console.log("Error1: ", error1);

    // // Make an external API call with the row data
    // const externalApiUrl = "https://some-external-api.com/endpoint";
    // try {
    //   const apiResponse = await axios.post(externalApiUrl, rowData);
    //   console.log("Successfully sent data to external API:", apiResponse.data);
    //   res.status(200).send("OK");
    // } catch (apiError) {
    //   console.error("Error sending data to external API:", apiError);
    //   res.status(500).send("Internal Server Error");
    // }
    res.status(200).send("OK");
  } else {
    // Handle other cases
    res.status(200).send("NOT OK");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
