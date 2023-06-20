

let webcams= [];
let videoRefs = [
  document.getElementById("user-video-0"),
  document.getElementById("user-video-1"),
  document.getElementById("user-video-2")
];



async function doStuff() {
  await fetchWebcams();
  console.log(webcams)
  for(const webcam of webcams){
  

    }

}

getWebcam = async(webcam_number) => {
  await navigator.mediaDevices.getUserMedia({ video: { deviceId: webcams[webcam_number].deviceId } })
    .then(stream => {
      
      videoRefs[webcam_number].srcObject = stream;
      console.log(webcams[webcam_number].deviceId )
    
    })
    .catch((error) => { console.log(error); })
}



async function fetchWebcams() {
  try {
    await navigator.mediaDevices.enumerateDevices()
      .then(resuslts => { resuslts.forEach(resuslt => { if(resuslt.kind === 'videoinput') webcams.push(resuslt); })})
      .catch(error => { console.log(error);})
  }
  catch (error) { console.error(error); }
  finally{
    await getWebcam(0);
    await getWebcam(1);
    await getWebcam(4);

    
    
  }
 

}




 function hostvideo(){
  let vid=document.getElementById('host-video')
  vid.src='video/e4.mp4'
}