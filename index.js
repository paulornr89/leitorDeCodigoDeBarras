var Quagga = window.Quagga;
let useFrontCamera = false;
let videoStream;
const constraints = {
    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440,
      },
    },
  };
var App = {
    _scanner: null,
    init: function() {
        this.attachListeners();
    },
    activateScanner: function() {
        var scanner = this.configureScanner('.leitor'),
            onDetected = function (result) {
                document.querySelector('input.isbn').value = result.codeResult.code;
                stop();
            }.bind(this),
            stop = function() {
                scanner.stop();  // should also clear all event-listeners?
                scanner.removeEventListener('detected', onDetected);
                this.hideOverlay();
                this.attachListeners();
            }.bind(this);

        this.showOverlay(stop);
        scanner.addEventListener('detected', onDetected).start();
    },
    attachListeners: function() {
        var self = this,
            button = document.querySelector('.input-field input + button.scan');

        button.addEventListener("click", function onClick(e) {
            e.preventDefault();
            button.removeEventListener("click", onClick);
            self.activateScanner();
        });
    },
    showOverlay: function(cancelCb) {
        
        if (!this._overlay) {
            var content = document.querySelector('.close'),
                closeButton = document.createElement('div');

            closeButton.appendChild(document.createTextNode('X'));
            // content.className = 'overlay__content';
            closeButton.className = 'overlay__close';
            this._overlay = document.querySelector('.leitor');
            //this._overlay.className = 'overlay';
            this._overlay.appendChild(content);
            content.appendChild(closeButton);
            closeButton.addEventListener('click', function closeClick() {
                closeButton.removeEventListener('click', closeClick);
                cancelCb();
            });
            initializeCamera()
            
        } else {
            var closeButton = document.querySelector('.overlay__close');
            closeButton.addEventListener('click', function closeClick() {
                closeButton.removeEventListener('click', closeClick);
                cancelCb();
            });
        }
        this._overlay.style.display = "block";
    },
    hideOverlay: function() {
        if (this._overlay) {
            this._overlay.style.display = "none";
        }
    },
    configureScanner: function(selector) {
        if (!this._scanner) {
            this._scanner = Quagga
                .decoder({readers: ['ean_reader']})
                .locator({patchSize: 'medium'})
                .fromSource({
                    target: selector,
                    constraints: {
                        width: 600,
                        height: 500,
                        facingMode: "user"
                    }
                });
        }
        return this._scanner;
    }
};
App.init();

// initialize
async function initializeCamera() {
    stopVideoStream();
    constraints.video.facingMode = useFrontCamera ? "user" : "environment";

    try {
      videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = videoStream;
    } catch (err) {
      alert("Could not access the camera");
    }
  }

  function stopVideoStream() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }