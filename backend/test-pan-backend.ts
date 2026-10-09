import { verifyPanWithProvider } from './src/modules/pan/pan.service';

async function test() {
  try {
    const res = await verifyPanWithProvider('ABCDE1234A');
    console.log("Result:", res);
  } catch(e) {
    console.error("Error:", e);
  }
}

test();
