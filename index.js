// import { GoogleGenAI } from "@google/genai";
// import dotenv from 'dotenv';

// import readline from 'readline/promises'
// import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// dotenv.config();

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const mcpClient = new Client({
//   name:"expamle-client",
//   version:"1.0.0", 
// })



// const chatHistory=[];

// const rl= readline.createInterface({
//     input:process.stdin,
//     output:process.stdout,
// })

// mcpClient.connect(new StreamableHTTPServerTransport(new URL ("http://localhost:3000/mcp")))
//  .then(async()=>{
  
//   console.log("Connected to mcp server");
  

//   const tools= (await mcpClient.listTools()).tools
//   console.log("avaible tools : ", tools);
  
     
//  })


// async function main() {
 
//   const question = await rl.question('You: ')

//   chatHistory.push({
//     role:"user",
//     parts:[{
//       text:question,
//       type:"text"
//     }]
//   })

//   const result = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: chatHistory,
//   });

//  const responseText= result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received"

//   chatHistory.push({
//     role:"model",
//     parts:[
//       {
//         text: responseText,
//         type:'text'
//       }
//     ]
//   })
//   console.log(`AI: ${responseText}`);
  

//   // If you're using v2.5, the result structure may include a 'candidates' array
//   // console.log(result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received");

// }
// await mcpClient.initialize();
// main();
import { config } from 'dotenv';
import readline from 'readline/promises'
import { GoogleGenAI } from "@google/genai"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"


config()
let tools = []
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const mcpClient = new Client({
    name: "example-client",
    version: "1.0.0",
})



const chatHistory = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))
    .then(async () => {

        console.log("Connected to mcp server")

        tools = (await mcpClient.listTools()).tools.map(tool => {
            return {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: tool.inputSchema.type,
                    properties: tool.inputSchema.properties,
                    required: tool.inputSchema.required
                }
            }
        })

        chatLoop()


    })

async function chatLoop(toolCall) {

    if (toolCall) {

        console.log("calling tool ", toolCall.name)

        chatHistory.push({
            role: "model",
            parts: [
                {
                    text: `calling tool ${toolCall.name}`,
                    type: "text"
                }
            ]
        })

        const toolResult = await mcpClient.callTool({
            name: toolCall.name,
            arguments: toolCall.args
        })

        chatHistory.push({
            role: "user",
            parts: [
                {
                    text: "Tool result : " + toolResult.content[ 0 ].text,
                    type: "text"
                }
            ]
        })

    } else {
        const question = await rl.question('You: ');
        chatHistory.push({
            role: "user",
            parts: [
                {
                    text: question,
                    type: "text"
                }
            ]
        })
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: chatHistory,
        config: {
            tools: [
                {
                    functionDeclarations: tools,
                }
            ]
        }
    })
    const functionCall = response.candidates[ 0 ].content.parts[ 0 ].functionCall
    const responseText = response.candidates[ 0 ].content.parts[ 0 ].text

    if (functionCall) {
        return chatLoop(functionCall)
    }


    chatHistory.push({
        role: "model",
        parts: [
            {
                text: responseText,
                type: "text"
            }
        ]
    })

    console.log(`AI: ${responseText}`)


    chatLoop()

}
