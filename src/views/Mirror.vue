<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ToolPage from '../components/ToolPage.vue';

const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const errorMsg = ref('');
const isRunning = ref(false);
const videoWidth = ref(640);

const startCamera = async () => {
  try {
    errorMsg.value = '';
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value;
      isRunning.value = true;
    }
  } catch (err: any) {
    errorMsg.value = '无法访问摄像头: ' + err.message;
    console.error('Error accessing camera:', err);
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  isRunning.value = false;
};

const zoomIn = () => {
  if (videoWidth.value < 1600) {
    videoWidth.value += 320;
  }
};

const resetSize = () => {
  videoWidth.value = 640;
};

const takePhoto = () => {
  if (videoElement.value && canvasElement.value) {
    const video = videoElement.value;
    const canvas = canvasElement.value;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Mirror the context to match the user's view
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      // Draw the video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);

      // Trigger download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.download = `mirror-photo-${timestamp}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error('Failed to take photo', e);
        errorMsg.value = '拍照失败';
      }
    }
  }
};

onMounted(() => {
  startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <ToolPage title="Mirror" maxWidth="100%">
    <div class="mirror-container">
      <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>
      
      <!-- Hidden canvas for taking photos -->
      <canvas ref="canvasElement" style="display: none;"></canvas>

      <div class="content-row">
        <div class="video-wrapper" :style="{ maxWidth: videoWidth + 'px' }">
          <video 
            ref="videoElement" 
            autoplay 
            playsinline 
            class="mirror-video"
            :class="{ active: isRunning }"
          ></video>
          <div v-if="!isRunning && !errorMsg" class="placeholder">
            <p>摄像头已关闭</p>
          </div>
        </div>

        <div class="controls">
          <template v-if="!isRunning">
            <button @click="startCamera" class="btn-primary">打开摄像头</button>
          </template>
          <template v-else>
            <button @click="takePhoto" class="btn-primary">📸 拍照</button>
            <button @click="zoomIn" :disabled="videoWidth >= 1600">调大</button>
            <button @click="resetSize" :disabled="videoWidth === 640">恢复默认大小</button>
            <button @click="stopCamera" class="danger-btn">关闭摄像头</button>
          </template>
        </div>
      </div>
    </div>
  </ToolPage>
</template>

<style scoped>
.mirror-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding-top: 20px;
  overflow-x: hidden;
}

.content-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
  width: 100%;
}

.error-banner {
  background-color: #fef2f2;
  color: var(--danger);
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  max-width: 640px;
  text-align: center;
  border: 1px solid #fecaca;
}

.video-wrapper {
  flex: 1; /* Allow it to shrink/grow but max-width controls size */
  width: 100%;
  /* Remove aspect-ratio here to let it adapt or keep it if strictly 4:3 is desired regardless of content. 
     Keeping it ensures the box shape before video loads. */
  aspect-ratio: 4/3;
  background: #18181b;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: max-width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mirror-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror effect */
}

.placeholder {
  position: absolute;
  color: #a1a1aa;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 160px;
  flex-shrink: 0;
  padding-top: 20px; /* Align slightly better with video top */
}

button {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  width: 100%; /* Full width buttons in sidebar */
  justify-content: center; /* Center text */
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.danger-btn {
  background: white;
  color: var(--danger);
  border-color: var(--border);
}

.danger-btn:hover {
  background: #fef2f2;
  border-color: var(--danger);
}

/* Responsive adjustment for smaller screens */
@media (max-width: 800px) {
  .content-row {
    flex-direction: column;
    align-items: center;
  }
  
  .controls {
    width: 100%;
    max-width: 400px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding-top: 0;
  }

  button {
    width: auto;
    flex: 1;
    min-width: 120px;
  }
}
</style>
