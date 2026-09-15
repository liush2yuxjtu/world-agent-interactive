import {runSimulation} from './model.mjs';
self.onmessage=({data})=>{
  try {self.postMessage({type:'complete',run:runSimulation(data,progress=>self.postMessage({type:'progress',progress}))});}
  catch(error) {self.postMessage({type:'error',message:error.message});}
};
