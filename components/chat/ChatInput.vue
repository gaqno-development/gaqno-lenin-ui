<template>
  <div
    class="border-t-4 border-double border-border bg-card p-4 pb-6 md:pb-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] shrink-0 z-20 animate-slide-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]"
  >
    <div class="flex items-end space-x-3 max-w-4xl mx-auto">
      <div class="flex-1">
        <Textarea
          v-model="question"
          placeholder="Escreva sua mensagem, camarada..."
          class="min-h-[48px] max-h-[120px] resize-none bg-background border-2 border-input text-foreground placeholder:text-muted-foreground/70 font-serif text-lg p-3 shadow-inner focus:ring-primary/50 transition-all hover:border-primary/50 focus:scale-[1.01]"
          rows="1"
          @keyup.enter.prevent="handleSubmit"
          @input="autoResize"
        />
      </div>

      <div class="flex space-x-2 shrink-0">
        <Button
          :disabled="isLoading || isTranscribing"
          :variant="isRecording ? 'destructive' : 'outline'"
          class="relative border-border text-foreground shadow-sm h-12 w-12 transition-all active:scale-95"
          :class="
            isRecording
              ? 'animate-pulse bg-destructive hover:bg-destructive/90'
              : 'hover:bg-muted'
          "
          :aria-label="
            isTranscribing
              ? 'Transcrevendo...'
              : isRecording
                ? 'Parar gravação'
                : 'Falar (gravar áudio para texto)'
          "
          @click="toggleMic"
        >
          <span
            v-if="isTranscribing"
            class="inline-block h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
          />
          <Icon
            v-else
            :name="isRecording ? 'mdi:stop' : 'mdi:microphone'"
            class="h-5 w-5"
          />
        </Button>

        <Button
          :disabled="isLoading || !question.trim()"
          class="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-serif uppercase tracking-wider h-12 px-4 md:px-6 transition-all active:scale-95"
          @click="handleSubmit"
        >
          <Icon name="mdi:send" class="h-5 w-5" />
          <span class="sr-only md:not-sr-only md:ml-2">Enviar</span>
        </Button>

        <Button
          variant="outline"
          class="border-border hover:bg-destructive hover:text-destructive-foreground text-foreground shadow-sm h-12 w-12 transition-all active:scale-95"
          @click="clearMessages"
        >
          <Icon name="mdi:trash-can-outline" class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStt } from "~/composables/useStt";
import { useToast } from "~/composables/useToast";

interface IChatInputProps {
  isLoading: boolean;
}

interface IChatInputEmits {
  (e: "submit", question: string): void;
  (e: "clear"): void;
}

defineProps<IChatInputProps>();
const emit = defineEmits<IChatInputEmits>();

const question = ref("");
const {
  startRecording,
  stopAndTranscribe,
  isTranscribing,
  isRecording,
  error: sttError,
} = useStt();
const { showError } = useToast();

watch(sttError, (msg) => {
  if (msg) {
    showError("Erro no áudio", msg);
  }
});

const toggleMic = async () => {
  if (isTranscribing.value) return;
  if (isRecording.value) {
    try {
      const text = await stopAndTranscribe();
      if (text) {
        question.value = question.value.trim()
          ? `${question.value.trim()} ${text}`
          : text;
        const textarea = document.querySelector("textarea");
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
        }
      }
    } catch {
      // Error already shown via sttError watch
    }
    return;
  }
  try {
    await startRecording();
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Não foi possível acessar o microfone.";
    showError("Microfone", message);
  }
};

const handleSubmit = () => {
  if (question.value.trim() === "") {
    return;
  }

  const questionText = question.value;
  question.value = "";

  const textarea = document.querySelector("textarea");
  if (textarea) {
    textarea.style.height = "auto";
  }

  emit("submit", questionText);
};

const clearMessages = () => {
  emit("clear");
};

const autoResize = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
};
</script>
