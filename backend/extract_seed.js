const fs = require('fs');
const readline = require('readline');

async function extractSeed() {
  const logPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\e91bf301-6452-47f5-bfc4-a147d5abc079\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let foundCode = null;

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.tool_name === 'default_api:write_to_file' && call.tool_arguments.TargetFile && call.tool_arguments.TargetFile.endsWith('seed.ts')) {
              // Get the first one that has 66 mata kuliah or lots of data
              const code = call.tool_arguments.CodeContent;
              if (code && code.includes('66')) {
                  foundCode = code;
                  break;
              }
              if (code && code.includes('kode:')) {
                  foundCode = code; // Just grab it if it looks big
              }
          }
        }
      }
    } catch(e) {}
  }
  
  if (foundCode) {
      fs.writeFileSync('d:\\laragon\\www\\SI-OBE\\backend\\prisma\\seed.ts', foundCode, 'utf8');
      console.log('Restored original seed.ts!');
  } else {
      console.log('Not found in transcript.');
  }
}

extractSeed();
