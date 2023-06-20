
// Calling setBackend() method
tf.setBackend('webgl');
  
// Calling ready() method and
// Printing output

async function checkBackend(){
  await tf.ready().then(() => {
    console.log(JSON.stringify(tf.getBackend()))
  });
}

let hostVideo = document.getElementById('host-video');
const hostCanvas = document.getElementById('hostVideoCanvas');

let myCanvas = document.getElementById('myVideoCanvas');
let myVideo = document.getElementById('myVideo'); // video tag where the audiences video will be shown

//step variables
let stepOneStarted = false, stepTwoStarted = false, stepThreeStarted = false, stepFourStarted = false, stepFiveStarted = false, stepSixStarted = false, stepSevenStarted = false
let stepOneCorrected = false, stepTwoCorrected = false, stepThreeCorrected = false, stepFourCorrected = false, stepFiveCorrected = false, stepSixCorrected = false, stepSevenCorrected = false
let leftElbowCorrect = false, rightElbowCorrect = false, leftShoulderCorrect = false, rightShoulderCorrect = false, leftHipCorrect = false, rightHipCorrect = false, leftKneeCorrect = false, rightKneeCorrect = false, twistRightCorrect = false, twistLeftCorrect = false


//audio files start
const s1cAudio = new Audio("audio/step1completed.mp3");
const s2cAudio = new Audio("audio/step2completed.mp3");
const s3cAudio = new Audio("audio/step3completed.mp3");
const s4cAudio = new Audio("audio/step4completed.mp3");

const leftShoulderAway = new Audio("audio/move left shoulder away.mp3");
const leftShoulderClose = new Audio("audio/Bring left Shoulder closer.mp3");

const rightShoulderAway = new Audio("audio/move right shoulder away.mp3");
const rightShoulderClose = new Audio("audio/Bring right Shoulder closer.mp3");


const leftElbowFlex = new Audio("audio/Flex left elbow.mp3");
const leftElbowExtend = new Audio("audio/Extend left elbow.mp3");


const rightElbowFlex = new Audio("audio/flex right elbow.mp3");
const rightElbowExtend = new Audio("audio/Extend right elbow.mp3");


const leftHipClose = new Audio("audio/Bring left Hip closer.mp3")
const leftHipApart = new Audio("audio/Keep left Hip apart.mp3")

const rightHipClose = new Audio("audio/Bring right Hip closer.mp3")
const rightHipApart = new Audio("audio/Keep right Hip apart.mp3")

const rightKneeFlex = new Audio("audio/Flex right knee.mp3")
const rightKneeExtend = new Audio("audio/Extend right knee.mp3")

const leftKneeFlex = new Audio("audio/Flex left knee.mp3")
const leftKneeExtend = new Audio("audio/Extend left knee.mp3")

const bendLeft = new Audio("audio/Bend to your left.mp3")
const bendRight = new Audio("audio/Bend to your right.mp3")

const rightArmDown = new Audio("audio/right arm down.mp3")
const rightArmForward = new Audio("audio/right arm forward.mp3")

const leftArmDown = new Audio("audio/left arm down.mp3")
const leftArmForward = new Audio("audio/left arm forward.mp3")

const twistRight = new Audio("audio/twist to your right.mp3")
const twistLeft = new Audio("audio/twist to your left.mp3")
const twistCenter = new Audio("audio/twist back to your center.mp3")

const holdForFive = new Audio("audio/hold5.mp3")
const holdPosition = new Audio("audio/goodHoldPosition.mp3")
//audio files end

let playAudio = false

//host video variables
let hostVideoPaused = true, oneFrame = true


//pose variables and scoreThreshold
let hostDetector, myDetector;
let hostPose, myPose;
let scoreThreshold = 0;

let myStreaming = false, startComparisonVariable = false;

const correctFrames = 10
let correctFrameCount = 0 // joint should be correct over these many frames to proceed

// canvas and video width and height variables
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)


// audio delay
const jointStepDelay = 1500


let width = 0.5*vw
let hostHeight, myHeight;


let showHostVideo = async () => {
  hostVideo.crossOrigin = "anonymous"
  hostVideo.src = 'backpain/e4.mp4'
  hostVideo.load();
}


function draw(){
  if(hostVideo.currentTime > 6 && stepOneStarted == false){
    hostVideoPaused = true
    stepOneStarted = true
    hostVideo.pause()
  }


  if(hostVideo.currentTime > 20 && stepTwoStarted == false){
    hostVideoPaused = true
    stepTwoStarted = true
    hostVideo.pause()
  }

  if(hostVideo.currentTime > 30 && stepThreeStarted == false){
    hostVideoPaused = true
    stepThreeStarted = true
    hostVideo.pause()
  }

  if(hostVideo.currentTime > 37 && stepFourStarted == false){
    hostVideoPaused = true
    stepFourStarted = true
    hostVideo.pause()
  }

  if(hostVideo.currentTime > 40 && stepFiveStarted == false){
    hostVideoPaused = true
    stepFiveStarted = true
    hostVideo.pause()
  }

  if(hostVideo.currentTime > 48 && stepSixStarted == false){
    hostVideoPaused = true
    stepSixStarted = true
    hostVideo.pause()
  }



  if(hostHeight && hostVideoPaused && oneFrame){
    // console.log('estimating pose ');
    detectPoseHost()
    oneFrame = false
  }

  if(myHeight && myStreaming){
    detectPoseMine()
  }

}


function playVideo(){
  hostVideo.play()
  hostVideoPaused = false
  oneFrame = true
  hostHeight = hostVideo.videoHeight / (hostVideo.videoWidth / width);
  hostCanvas.setAttribute('width', width);
  hostCanvas.setAttribute('height', hostHeight);
}

let loadModels =  async () => {
  console.log("loading");
  if(hostVideo.readyState >= 3){
    hostDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});
    myDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});
    startComparisonVariable = true;
    document.getElementById('pose-controls').style.display = 'flex'
    console.log("DONE");
  }
}




let startMyCamera = async (e) => {
  // Get media stream
  console.log("starting cams");
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(stream) {
      // Link to the video source
      console.log("got cams");
      myVideo.srcObject = stream;
      // Play video
      myVideo.play();
    })
    .catch(function(err) {
      console.log(`Error: ${err}`);
    });
      // Play when ready
      myVideo.addEventListener('canplay', function(e) {
      myHeight = myVideo.videoHeight / (myVideo.videoWidth / width);
      myCanvas.setAttribute('width', width);
      myCanvas.setAttribute('height', myHeight);
      myVideo.setAttribute('width', width);
      myVideo.setAttribute('height', myHeight);

      myStreaming = true
  }, false);

}



let detectPoseMine = async () => {
  myVideo.setAttribute('width', width);

  myPose = await myDetector.estimatePoses(myVideo,{
            flipHorizontal: false
        })
  const context = myCanvas.getContext('2d');
  if(width && myHeight && myPose[0]){
    myCanvas.width = width;
    myCanvas.height = myHeight;
    context.drawImage(myVideo, 0, 0, width, myHeight);

    for(let i=0; i<myPose[0].keypoints.length; i++){
      if(myPose[0].keypoints[i].score > scoreThreshold){
        context.beginPath();
        var x = (myPose[0].keypoints[i].x/myVideo.videoWidth)*width
        var y = (myPose[0].keypoints[i].y/myVideo.videoHeight)*myHeight
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fillStyle = "green";
        context.fill();
      }
    }



    playAudio = true
    if(stepOneStarted && !stepOneCorrected && playAudio){
       if(!leftHipCorrect){
            playAudio = false
            var out = correctLeftHip(context)
            if(!out){
              correctFrameCount = correctFrameCount + 1
            }
            if(correctFrameCount == correctFrames){
              leftHipCorrect = true
              correctFrameCount = 0
            }
          }


        if(!rightHipCorrect && playAudio && leftHipCorrect){
             var out = correctRightHip(context)
             if(!out){
               correctFrameCount = correctFrameCount + 1
             }
             if(correctFrameCount == correctFrames){
               rightHipCorrect = true
               correctFrameCount = 0
             }
           }




        if(!leftShoulderCorrect && playAudio && rightHipCorrect){
           var out = correctLeftShoulder(context)
           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             leftShoulderCorrect = true
             correctFrameCount = 0
           }
          }




          if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
             var out = correctRightShoulder(context)
             if(!out){
               correctFrameCount = correctFrameCount + 1
             }
             if(correctFrameCount == correctFrames){
               rightShoulderCorrect = true
               correctFrameCount = 0
             }
            }



        if(leftHipCorrect && rightHipCorrect && leftShoulderCorrect && rightShoulderCorrect && playAudio){



          leftHipCorrect = false
          rightHipCorrect = false
          leftShoulderCorrect = false
          rightShoulderCorrect = false

          holdPosition.play()
          stepOneCorrected = true
          console.log('Step one complete');
          setTimeout(function(){
            playVideo()
          }, 2000);

        }


        if(!stepOneCorrected){
          setTimeout(function(){
            playAudio = true
          }, jointStepDelay);
        }

    }



//step two
    if(stepOneCorrected && !stepTwoCorrected && stepTwoStarted && playAudio){
       if(!rightHipCorrect){
           playAudio = false
           var out = correctRightHip(context)
            if(!out){
              correctFrameCount = correctFrameCount + 1
            }
            if(correctFrameCount == correctFrames){
              rightHipCorrect = true
              correctFrameCount = 0
            }
          }


        if(!leftHipCorrect && playAudio && rightHipCorrect){
           var out = correctLeftHip(context)
           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             leftHipCorrect = true
             correctFrameCount = 0
           }
          }




        if(!leftShoulderCorrect && playAudio && leftHipCorrect){
           var out = correctLeftShoulder(context, true, 30)
           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             leftShoulderCorrect = true
             correctFrameCount = 0
           }
          }




          if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
             var out = correctRightShoulder(context, true, 30)


             if(!out){
               correctFrameCount = correctFrameCount + 1
             }
             if(correctFrameCount == correctFrames){
               rightShoulderCorrect = true
               correctFrameCount = 0
             }

            }






        if(leftShoulderCorrect && rightShoulderCorrect && rightHipCorrect && leftHipCorrect && playAudio){


          leftShoulderCorrect = false
          rightShoulderCorrect = false
          rightHipCorrect = false
          leftHipCorrect = false

          holdPosition.play()
          stepTwoCorrected = true
          console.log('Step two complete');
          setTimeout(function(){
            playVideo()
          }, 2000);

        }

          if(!stepTwoCorrected){
            setTimeout(function(){
              playAudio = true
            }, jointStepDelay);
          }

    }


// step three
if(stepTwoCorrected && !stepThreeCorrected && stepThreeStarted && playAudio){


  if(!twistRightCorrect){
        playAudio = false
        var out = correctTwistRight(context)
         if(!out){
           correctFrameCount = correctFrameCount + 1
         }
         if(correctFrameCount == correctFrames){
           twistRightCorrect = true
           correctFrameCount = 0
         }

     }


   if(!leftElbowCorrect && playAudio && twistRightCorrect){
        var out = correctLeftElbow(context)
        if(!out){
          correctFrameCount = correctFrameCount + 1
        }
        if(correctFrameCount == correctFrames){
          leftElbowCorrect = true
          correctFrameCount = 0
        }
      }


    if(!rightElbowCorrect && playAudio && leftElbowCorrect){
           var out = correctRightElbow(context)

           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             rightElbowCorrect = true
             correctFrameCount = 0
           }
       }




    if(!leftShoulderCorrect && playAudio && rightElbowCorrect){
          var out = correctLeftShoulder(context, true, 10)


           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             leftShoulderCorrect = true
             correctFrameCount = 0
           }


      }




      if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
         var out = correctRightShoulder(context, true, 10)

         if(!out){
           correctFrameCount = correctFrameCount + 1
         }
         if(correctFrameCount == correctFrames){
           rightShoulderCorrect = true
           correctFrameCount = 0
         }


        }


        if(!rightHipCorrect && playAudio && rightShoulderCorrect){
               var out = correctRightHip(context, 20)


               if(!out){
                 correctFrameCount = correctFrameCount + 1
               }
               if(correctFrameCount == correctFrames){
                 rightHipCorrect = true
                 correctFrameCount = 0
               }

          }

          if(!leftHipCorrect && playAudio && rightHipCorrect){
                 var out = correctLeftHip(context, 20)

                 if(!out){
                   correctFrameCount = correctFrameCount + 1
                 }
                 if(correctFrameCount == correctFrames){
                   leftHipCorrect = true
                   correctFrameCount = 0
                 }

            }



    if(twistRightCorrect && leftElbowCorrect && rightElbowCorrect && leftShoulderCorrect && rightShoulderCorrect && rightHipCorrect && leftHipCorrect && playAudio){



      twistRightCorrect = false
      leftElbowCorrect = false
      rightElbowCorrect = false
      leftShoulderCorrect = false
      rightShoulderCorrect = false
      rightHipCorrect = false
      leftHipCorrect = false

      holdForFive.play()
      stepThreeCorrected = true
      console.log('Step three complete');
      setTimeout(function(){
        playVideo()
      }, 9000);

    }

      if(!stepThreeCorrected){
        setTimeout(function(){
          playAudio = true
        }, jointStepDelay);
      }

}

// step four
if(stepThreeCorrected && !stepFourCorrected && stepFourStarted && playAudio){ //here
   if(!twistRightCorrect){

        playAudio = false
        var out = correctTwistRight(context, true)

        if(!out){
          correctFrameCount = correctFrameCount + 1
        }
        if(correctFrameCount == correctFrames){
          twistRightCorrect = true
          correctFrameCount = 0
        }

    }



    if(!leftShoulderCorrect && playAudio && twistRightCorrect){
       var out = correctLeftShoulder(context, true, 30)
       if(!out){
         correctFrameCount = correctFrameCount + 1
       }
       if(correctFrameCount == correctFrames){
         leftShoulderCorrect = true
         correctFrameCount = 0
       }
      }




      if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
         var out = correctRightShoulder(context, true, 30)


         if(!out){
           correctFrameCount = correctFrameCount + 1
         }
         if(correctFrameCount == correctFrames){
           rightShoulderCorrect = true
           correctFrameCount = 0
         }

        }






        if(!rightHipCorrect && playAudio && rightShoulderCorrect){
           var out = correctRightHip(context, 20)

           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             rightHipCorrect = true
             correctFrameCount = 0
           }


          }

          if(!leftHipCorrect && playAudio && rightHipCorrect){
             var out = correctLeftHip(context, 20)


             if(!out){
               correctFrameCount = correctFrameCount + 1
             }
             if(correctFrameCount == correctFrames){
               leftHipCorrect = true
               correctFrameCount = 0
             }

            }



    if(twistRightCorrect &&  leftShoulderCorrect && rightShoulderCorrect && rightHipCorrect && leftHipCorrect && playAudio){



      leftShoulderCorrect = false
      rightShoulderCorrect = false
      rightHipCorrect = false
      leftHipCorrect = false
      twistRightCorrect = false

      holdPosition.play()
      stepFourCorrected = true //here
      console.log('Step four complete');
      setTimeout(function(){
        playVideo()
      }, 2000);

    }

      if(!stepFourCorrected){ // here
        setTimeout(function(){
          playAudio = true
        }, jointStepDelay);
      }

}

//step five
if(stepFourCorrected && !stepFiveCorrected && stepFiveStarted && playAudio){ //here
  if(!twistLeftCorrect){
        playAudio = false
        var out = correctTwistLeft(context)
         if(!out){
           correctFrameCount = correctFrameCount + 1
         }
         if(correctFrameCount == correctFrames){
           twistLeftCorrect = true
           correctFrameCount = 0
         }

     }


   if(!leftElbowCorrect && playAudio && twistLeftCorrect){
        var out = correctLeftElbow(context)
        if(!out){
          correctFrameCount = correctFrameCount + 1
        }
        if(correctFrameCount == correctFrames){
          leftElbowCorrect = true
          correctFrameCount = 0
        }
      }


    if(!rightElbowCorrect && playAudio && leftElbowCorrect){
           var out = correctRightElbow(context)

           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             rightElbowCorrect = true
             correctFrameCount = 0
           }
       }




    if(!leftShoulderCorrect && playAudio && rightElbowCorrect){
          var out = correctLeftShoulder(context, true, 20)


           if(!out){
             correctFrameCount = correctFrameCount + 1
           }
           if(correctFrameCount == correctFrames){
             leftShoulderCorrect = true
             correctFrameCount = 0
           }


      }




      if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
         var out = correctRightShoulder(context, true, 20)

         if(!out){
           correctFrameCount = correctFrameCount + 1
         }
         if(correctFrameCount == correctFrames){
           rightShoulderCorrect = true
           correctFrameCount = 0
         }


        }


        if(!rightHipCorrect && playAudio && rightShoulderCorrect){
               var out = correctRightHip(context)


               if(!out){
                 correctFrameCount = correctFrameCount + 1
               }
               if(correctFrameCount == correctFrames){
                 rightHipCorrect = true
                 correctFrameCount = 0
               }

          }

          if(!leftHipCorrect && playAudio && rightHipCorrect){
                 var out = correctLeftHip(context)

                 if(!out){
                   correctFrameCount = correctFrameCount + 1
                 }
                 if(correctFrameCount == correctFrames){
                   leftHipCorrect = true
                   correctFrameCount = 0
                 }

            }



    if(twistLeftCorrect && leftElbowCorrect && rightElbowCorrect && leftShoulderCorrect && rightShoulderCorrect && rightHipCorrect && leftHipCorrect && playAudio){



      twistLeftCorrect = false
      leftElbowCorrect = false
      rightElbowCorrect = false
      leftShoulderCorrect = false
      rightShoulderCorrect = false
      rightHipCorrect = false
      leftHipCorrect = false

      holdForFive.play()
      stepFiveCorrected = true //here
      console.log('Step five complete');
      setTimeout(function(){
        playVideo()
      }, 9000);

    }

      if(!stepFiveCorrected){ // here
        setTimeout(function(){
          playAudio = true
        }, jointStepDelay);
      }

}


//step six
if(stepFiveCorrected && !stepSixCorrected && stepSixStarted && playAudio){ //here
  if(!twistLeftCorrect){

       playAudio = false
       var out = correctTwistLeft(context, true)

       if(!out){
         correctFrameCount = correctFrameCount + 1
       }
       if(correctFrameCount == correctFrames){
         twistLeftCorrect = true
         correctFrameCount = 0
       }

   }



   if(!leftShoulderCorrect && playAudio && twistLeftCorrect){
      var out = correctLeftShoulder(context, true, 30)
      if(!out){
        correctFrameCount = correctFrameCount + 1
      }
      if(correctFrameCount == correctFrames){
        leftShoulderCorrect = true
        correctFrameCount = 0
      }
     }




     if(!rightShoulderCorrect && playAudio && leftShoulderCorrect){
        var out = correctRightShoulder(context, true, 30)


        if(!out){
          correctFrameCount = correctFrameCount + 1
        }
        if(correctFrameCount == correctFrames){
          rightShoulderCorrect = true
          correctFrameCount = 0
        }

       }









       if(!rightHipCorrect && playAudio && rightShoulderCorrect){
          var out = correctRightHip(context)

          if(!out){
            correctFrameCount = correctFrameCount + 1
          }
          if(correctFrameCount == correctFrames){
            rightHipCorrect = true
            correctFrameCount = 0
          }


         }

         if(!leftHipCorrect && playAudio && rightHipCorrect){
            var out = correctLeftHip(context)


            if(!out){
              correctFrameCount = correctFrameCount + 1
            }
            if(correctFrameCount == correctFrames){
              leftHipCorrect = true
              correctFrameCount = 0
            }

           }



   if(twistLeftCorrect && leftShoulderCorrect && rightShoulderCorrect && rightHipCorrect && leftHipCorrect && playAudio){



     leftShoulderCorrect = false
     rightShoulderCorrect = false
     rightHipCorrect = false
     leftHipCorrect = false
     twistLeftCorrect = false

      holdPosition.play()
      stepSixCorrected = true //here
      console.log('Step six complete');
      setTimeout(function(){
        playVideo()
      }, 2000);

    }

      if(!stepSixCorrected){ // here
        setTimeout(function(){
          playAudio = true
        }, jointStepDelay);
      }

}






  }
  myVideo.setAttribute('width', 0);
}

let detectPoseHost = async () => {
  hostVideo.setAttribute('width', width);

  hostPose = await hostDetector.estimatePoses(hostVideo,{
            flipHorizontal: false
        })


  if(hostPose[0]){
    const context = hostCanvas.getContext('2d');
    if(width && hostHeight && hostPose[0]){
      hostCanvas.width = width;
      hostCanvas.height = hostHeight;
      context.drawImage(hostVideo, 0, 0, width, hostHeight);
        // console.log(hostPose);
          for(let i=0; i<hostPose[0].keypoints.length; i++){
            if(hostPose[0].keypoints[i].score > scoreThreshold){
              context.beginPath();
              var x = (hostPose[0].keypoints[i].x/hostVideo.videoWidth)*width
              var y = (hostPose[0].keypoints[i].y/hostVideo.videoHeight)*hostHeight
              context.arc(x, y, 5, 0, 2 * Math.PI);
              context.fillStyle = "green";
              context.fill();
            }
          }
    }
    hostVideo.setAttribute('width', width);
  }
}





function correctRightElbow(canvasCtxMine, maxAngleDiffernce = 10 ){


  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){

    var errorPresent = false
    // audience angles
    var myRightElbow = find_angle(myPose[0].keypoints[6], myPose[0].keypoints[8], myPose[0].keypoints[10]);

    //host angles
    var hostRightElbow = find_angle(hostPose[0].keypoints[6], hostPose[0].keypoints[8], hostPose[0].keypoints[10]);



  //rightElbow
  if(Math.abs(myRightElbow - hostRightElbow) > maxAngleDiffernce){

    if(hostPose[0].keypoints[8].score > scoreThreshold && hostPose[0].keypoints[6].score > scoreThreshold && hostPose[0].keypoints[10].score > scoreThreshold){
      if(myPose[0].keypoints[8].score > scoreThreshold && myPose[0].keypoints[6].score > scoreThreshold && myPose[0].keypoints[10].score > scoreThreshold){

        errorPresent = true



        if((myRightElbow - hostRightElbow) > 0){
          rightElbowFlex.play()

        }
        else{
          rightElbowExtend.play()

        }

        canvasCtxMine.beginPath()
        var x = (myPose[0].keypoints[8].x/myVideo.videoWidth)*width
        var y = (myPose[0].keypoints[8].y/myVideo.videoHeight)*myHeight
        canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
        canvasCtxMine.fillStyle = "red"
        canvasCtxMine.fill()
      }
    }
  }
}
return errorPresent
}

function correctLeftElbow(canvasCtxMine, maxAngleDiffernce = 10){


  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){

    var errorPresent = false
    // audience angles
    var myLeftElbow = find_angle(myPose[0].keypoints[5], myPose[0].keypoints[7], myPose[0].keypoints[9]);

    //host angles
    var hostLeftElbow = find_angle(hostPose[0].keypoints[5], hostPose[0].keypoints[7], hostPose[0].keypoints[9]);

  //leftElbow
  if(Math.abs(myLeftElbow - hostLeftElbow) > maxAngleDiffernce){

    if(hostPose[0].keypoints[7].score > scoreThreshold  && hostPose[0].keypoints[5].score > scoreThreshold  && hostPose[0].keypoints[9].score > scoreThreshold){
      if(myPose[0].keypoints[7].score > scoreThreshold && myPose[0].keypoints[5].score > scoreThreshold && myPose[0].keypoints[9].score > scoreThreshold){
        errorPresent = true

        if((myLeftElbow - hostLeftElbow) > 0){
          leftElbowFlex.play()


        }
        else{
          leftElbowExtend.play()

        }

        canvasCtxMine.beginPath()
        var x = (myPose[0].keypoints[7].x/myVideo.videoWidth)*width
        var y = (myPose[0].keypoints[7].y/myVideo.videoHeight)*myHeight
        canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
        canvasCtxMine.fillStyle = "red"
        canvasCtxMine.fill()
      }
    }
  }
}
return errorPresent
}




function correctRightShoulder(canvasCtxMine, forwardDown = false, maxAngleDiffernce = 10 ){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myRightShoulder = find_angle(myPose[0].keypoints[12], myPose[0].keypoints[6], myPose[0].keypoints[10]);

    //host angles
    var hostRightShoulder = find_angle(hostPose[0].keypoints[12], hostPose[0].keypoints[6], hostPose[0].keypoints[10]);


    //RightShoulder
    if(Math.abs(myRightShoulder - hostRightShoulder) > maxAngleDiffernce){


      if(hostPose[0].keypoints[6].score > scoreThreshold  && hostPose[0].keypoints[12].score > scoreThreshold && hostPose[0].keypoints[10].score > scoreThreshold){
        if(myPose[0].keypoints[6].score > scoreThreshold && myPose[0].keypoints[12].score > scoreThreshold && myPose[0].keypoints[10].score > scoreThreshold){

            errorPresent = true
            if((myRightShoulder - hostRightShoulder) > 0){
              if(forwardDown)
                rightArmDown.play()
              else
                rightShoulderClose.play()


            }
            else{
              if(forwardDown)
                rightArmForward.play()
              else
                rightShoulderAway.play()
            }


          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[6].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[6].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }
}
return errorPresent

}








function correctLeftShoulder(canvasCtxMine, forwardDown = false, maxAngleDiffernce = 10 ){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myLeftShoulder = find_angle(myPose[0].keypoints[9], myPose[0].keypoints[5], myPose[0].keypoints[11]);

    //host angles
    var hostLeftShoulder = find_angle(hostPose[0].keypoints[9], hostPose[0].keypoints[5], hostPose[0].keypoints[11]);



    //leftShoulder
    if(Math.abs(myLeftShoulder - hostLeftShoulder) > maxAngleDiffernce){


      if(hostPose[0].keypoints[5].score > scoreThreshold && hostPose[0].keypoints[9].score > scoreThreshold && hostPose[0].keypoints[11].score > scoreThreshold){
        if(myPose[0].keypoints[5].score > scoreThreshold && myPose[0].keypoints[9].score > scoreThreshold && myPose[0].keypoints[11].score > scoreThreshold){

            errorPresent = true
            if((myLeftShoulder - hostLeftShoulder) > 0){
              if(forwardDown)
                leftArmDown.play()
              else
                leftShoulderClose.play()

            }
            else{
              if(forwardDown)
                leftArmForward.play()
              else
                leftShoulderAway.play()
            }

          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[5].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[5].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }
}
return errorPresent

}


function correctRightHip(canvasCtxMine, maxHipAngleDiffernce = 10){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myRightHip = find_angle(myPose[0].keypoints[11], myPose[0].keypoints[12], myPose[0].keypoints[14]);

    //host angles
    var hostRightHip = find_angle(hostPose[0].keypoints[11], hostPose[0].keypoints[12], hostPose[0].keypoints[14]);


    //RightHip
    if(Math.abs(myRightHip - hostRightHip) > maxHipAngleDiffernce){
      // console.log(myRightHip);
      // console.log(hostRightHip);
      if(hostPose[0].keypoints[12].score > scoreThreshold && hostPose[0].keypoints[11].score > scoreThreshold && hostPose[0].keypoints[14].score > scoreThreshold){
        if(myPose[0].keypoints[12].score > scoreThreshold && myPose[0].keypoints[11].score > scoreThreshold && myPose[0].keypoints[14].score > scoreThreshold){

          errorPresent = true

          if((myRightHip - hostRightHip) > 0){
            rightHipClose.play()
          }
          else{
            rightHipApart.play()
          }

          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[12].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[12].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }
}
return errorPresent

}



function correctLeftHip(canvasCtxMine, maxHipAngleDiffernce = 10){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myLeftHip = find_angle(myPose[0].keypoints[12], myPose[0].keypoints[11], myPose[0].keypoints[13]);

    //host angles
    var hostLeftHip = find_angle(hostPose[0].keypoints[12], hostPose[0].keypoints[11], hostPose[0].keypoints[13]);



    //leftHip
    if(Math.abs(myLeftHip - hostLeftHip) > maxHipAngleDiffernce){

      if(hostPose[0].keypoints[11].score > scoreThreshold  && hostPose[0].keypoints[12].score > scoreThreshold && hostPose[0].keypoints[13].score > scoreThreshold){
        if(myPose[0].keypoints[11].score > scoreThreshold && myPose[0].keypoints[12].score > scoreThreshold && myPose[0].keypoints[13].score > scoreThreshold){
            errorPresent = true


            if((myLeftHip - hostLeftHip) > 0){
              leftHipClose.play()
            }
            else{
              leftHipApart.play()
            }


          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[11].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[11].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }
}
return errorPresent

}








function correctLeftKnee(canvasCtxMine, maxAngleDiffernce){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myLeftKnee = find_angle(myPose[0].keypoints[11], myPose[0].keypoints[13], myPose[0].keypoints[15]);

    //host angles
    var hostLeftKnee = find_angle(hostPose[0].keypoints[11], hostPose[0].keypoints[13], hostPose[0].keypoints[15]);



    //LeftKnee
    if(Math.abs(myLeftKnee - hostLeftKnee) > maxAngleDiffernce){
      if(hostPose[0].keypoints[13].score > scoreThreshold  && hostPose[0].keypoints[11].score > scoreThreshold && hostPose[0].keypoints[15].score > scoreThreshold){
        if(myPose[0].keypoints[13].score > scoreThreshold && myPose[0].keypoints[11].score > scoreThreshold && myPose[0].keypoints[15].score > scoreThreshold){



          errorPresent = true


          if((myLeftKnee - hostLeftKnee) > 0){
            leftKneeFlex.play()
          }
          else{
            leftKneeExtend.play()
          }


          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[13].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[13].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }

}
return errorPresent

}








function correctRightKnee(canvasCtxMine, maxAngleDiffernce){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false
    // audience angles
    var myRightKnee = find_angle(myPose[0].keypoints[12], myPose[0].keypoints[14], myPose[0].keypoints[16]);

    //host angles
    var hostRightKnee = find_angle(hostPose[0].keypoints[12], hostPose[0].keypoints[14], hostPose[0].keypoints[16]);



    //RightKnee
    if(Math.abs(myRightKnee - hostRightKnee) > maxAngleDiffernce){
      if(hostPose[0].keypoints[14].score > scoreThreshold  && hostPose[0].keypoints[12].score > scoreThreshold && hostPose[0].keypoints[16].score > scoreThreshold){
        if(myPose[0].keypoints[14].score > scoreThreshold && myPose[0].keypoints[12].score > scoreThreshold && myPose[0].keypoints[16].score > scoreThreshold){


          errorPresent = true


          if((myRightKnee - hostRightKnee) > 0){
            rightKneeFlex.play()
          }
          else{
            rightKneeExtend.play()
          }



          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[14].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[14].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()
        }
      }
    }
}
return errorPresent

}







function correctTwistRight(canvasCtxMine, center = false){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false

    var myUpperArm = (myPose[0].keypoints[5].x + myPose[0].keypoints[7].x)/7
    // var myUpperArm = myPose[0].keypoints[7].x
    var myNose = myPose[0].keypoints[0].x
    var myLeftWrist =  myPose[0].keypoints[9].x
    var myRightKnee =  myPose[0].keypoints[14].x
    // console.log('wist');
    // console.log(myLeftWrist);
    // console.log('knee');
    // console.log(myRightKnee);



    //RightKnee
    if(myRightKnee < myLeftWrist && !center){
      // console.log('here');

      if(myPose[0].keypoints[9].score > scoreThreshold  && myPose[0].keypoints[14].score > scoreThreshold){
        // console.log('here1');

          errorPresent = true


          twistRight.play()
          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[5].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[5].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()

      }
    }


      if(myRightKnee > myLeftWrist && center){
        if(myPose[0].keypoints[9].score > scoreThreshold  && myPose[0].keypoints[14].score > scoreThreshold){

            errorPresent = true
            twistCenter.play()
            canvasCtxMine.beginPath()
            var x = (myPose[0].keypoints[5].x/myVideo.videoWidth)*width
            var y = (myPose[0].keypoints[5].y/myVideo.videoHeight)*myHeight
            canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
            canvasCtxMine.fillStyle = "red"
            canvasCtxMine.fill()

        }
      }

}
return errorPresent

}





function correctTwistLeft(canvasCtxMine, center = false){

  hostVideo.setAttribute('width', 0);
  if (myStreaming && myPose[0] && hostPose[0]){
    var errorPresent = false


    var myRightWrist =  myPose[0].keypoints[10].x
    var myLeftKnee =  myPose[0].keypoints[13].x
    // console.log('wist');
    // console.log(myLeftWrist);
    // console.log('knee');
    // console.log(myRightKnee);



    //RightKnee
    if(myLeftKnee > myRightWrist && !center){
      // console.log('here');

      if(myPose[0].keypoints[10].score > scoreThreshold  && myPose[0].keypoints[13].score > scoreThreshold){
        // console.log('here1');

          errorPresent = true


          twistLeft.play()
          canvasCtxMine.beginPath()
          var x = (myPose[0].keypoints[6].x/myVideo.videoWidth)*width
          var y = (myPose[0].keypoints[6].y/myVideo.videoHeight)*myHeight
          canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
          canvasCtxMine.fillStyle = "red"
          canvasCtxMine.fill()

      }
    }


      if(myLeftKnee < myRightWrist && center){
        if(myPose[0].keypoints[10].score > scoreThreshold  && myPose[0].keypoints[13].score > scoreThreshold){

            errorPresent = true
            twistCenter.play()
            canvasCtxMine.beginPath()
            var x = (myPose[0].keypoints[6].x/myVideo.videoWidth)*width
            var y = (myPose[0].keypoints[6].y/myVideo.videoHeight)*myHeight
            canvasCtxMine.arc(x, y, 15, 0, 2 * Math.PI);
            canvasCtxMine.fillStyle = "red"
            canvasCtxMine.fill()

        }
      }

}
return errorPresent

}







function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return (Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB))* 180 / Math.PI);
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


showHostVideo()
document.getElementById('start-my-cam-button').addEventListener('click',startMyCamera)
document.getElementById('start-comparision-button').addEventListener('click',playVideo)
hostVideo.addEventListener('loadeddata', loadModels)
