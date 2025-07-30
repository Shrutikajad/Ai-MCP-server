import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



async function main() {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "2 + 2",
  });

  // If you're using v2.5, the result structure may include a 'candidates' array
  console.log(result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received");
}

main();



// const chatHistory=[];

// const rl= readline.createInterface({
//     input:process.stdin,
//     output:process.stdout,
// })

// async function chatLoop() {
//     const question= await rl.question('You: ')

//     chatHistory.push({
//         role: "user",
//         parts:[
//             {
//                 text:question,
//                 type:'text'
//             }
//         ]
//     })

//     const response = await ai.models.generateContent({
//         model:"gemini-2.5-flash",
//         contents:chatHistory
//     })

//     console.log(response.candidates[0].content.parts[0].text);
    
// }

// chatLoop()