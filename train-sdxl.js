import Replicate from 'replicate'
import { Headers } from "node-fetch";
import fetch from "node-fetch";
import * as dotenv from 'dotenv'

dotenv.config()
global.fetch = fetch;
global.Headers = Headers;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function main() {
  const training = await replicate.trainings.create(
    'stability-ai',
    'sdxl',
    'a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5',
    {
      destination: 'stockbet/sdxl-viking',
      input: {
        input_images: 'https://remwbrfkzindyqlksvyv.supabase.co/storage/v1/object/public/uploads/mmmm.zip'
      },
    //   webhook: "https://example.com/replicate-webhook",
    })
  console.log(`URL: https://replicate.com/p/${training.id}`)
}

main()

// Run: 
// node train-sdxl.js