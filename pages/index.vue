<template>
  <!-- <ToastProvider> -->
  <main class="flex flex-col h-[100dvh] bg-background relative overflow-hidden">
    <!-- Header -->
    <ChatHeader
      :user="client.user"
      @show-about="showAboutDialog = true"
      @show-settings="handleShowSettings"
    />

    <div class="flex flex-1 relative min-h-0">
      <!-- Main Content -->
      <section class="flex-1 flex flex-col relative z-10 h-full">
        <!-- Chat Container with Overflow - Flexible height -->
        <div
          class="flex-1 overflow-y-auto p-4 relative bg-background bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-muted/10 to-background/80"
        >
          <!-- Overlay for texture (optional) -->
          <div
            class="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"
          />

          <!-- Content with relative positioning to appear above overlay -->
          <div class="relative z-10">
            <!-- Welcome Card -->
            <WelcomeCard :is-loading="loadingMessage" @tip-click="handleTips" />

            <!-- Chat Messages -->
            <div ref="chatContainer" class="space-y-4">
              <TransitionGroup
                enter-active-class="transition ease-out duration-300 transform"
                enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition ease-in duration-300 transform"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-4 opacity-0"
              >
                <ChatMessage
                  v-for="(message, index) in responseStream"
                  :key="`response_${index}`"
                  :message="message"
                  :autoplay-enabled="audioStore.autoplayAudio"
                />
              </TransitionGroup>
            </div>

            <!-- Loading Spinner at bottom of chat -->
            <div
              v-if="loadingMessage"
              class="flex justify-center items-center py-8 mt-4"
            >
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
              />
              <span class="ml-2 text-sm text-muted-foreground"
                >Processando...</span
              >
            </div>
          </div>
        </div>

        <!-- Fixed Input Area at Bottom - Outside the scroll container -->
        <ChatInput
          :is-loading="loadingMessage"
          @submit="ask"
          @clear="clearMessages"
        />
      </section>
    </div>

    <!-- About Dialog -->
    <Dialog v-model:open="showAboutDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center space-x-3">
            <div>
              <DialogTitle class="pb-4"> LeninGPT </DialogTitle>
              <DialogDescription>
                Uma IA inspirada em Vladimir Ilyich Lenin, oferecendo insights
                sobre socialismo, história e filosofia marxista.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Icon name="mdi:brain" class="h-5 w-5 text-primary" />
              <span class="text-sm font-medium">Tecnologia</span>
            </div>
            <p class="text-sm text-muted-foreground ml-7">
              Desenvolvido com Nuxt 3, OpenAI GPT-4, TTS (gaqno-ai-service) e
              Supabase. Interface moderna com Tailwind CSS e Shadcn/ui.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Icon name="mdi:shield-check" class="h-5 w-5 text-green-600" />
              <span class="text-sm font-medium">Privacidade</span>
            </div>
            <p class="text-sm text-muted-foreground ml-7">
              Suas perguntas são registradas para análise e melhorias. Dados
              anonimizados e seguros.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Icon name="mdi:heart" class="h-5 w-5 text-red-500" />
              <span class="text-sm font-medium">Apoie o Projeto</span>
            </div>
            <div class="ml-7 space-y-2">
              <a
                href="https://www.buymeacoffee.com/gaqno"
                target="_blank"
                class="flex items-center space-x-2 text-sm text-amber-600 hover:text-amber-700 hover:underline"
              >
                <Icon name="mdi:coffee" class="h-4 w-4" />
                <span>Buy Me a Coffee</span>
              </a>
              <a
                href="https://link.mercadopago.com.br/gaqnodevelopment"
                target="_blank"
                class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Icon name="mdi:credit-card" class="h-4 w-4" />
                <span>Mercado Pago</span>
              </a>
              <a
                href="https://www.github.com/gaqno"
                target="_blank"
                class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 hover:underline"
              >
                <Icon name="mdi:github" class="h-4 w-4" />
                <span>GitHub do Desenvolvedor</span>
              </a>
            </div>
          </div>

          <div class="pt-2 border-t">
            <p class="text-xs text-muted-foreground text-center">
              Versão 1.0.0 • Desenvolvido com ❤️ por @gaqno
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Settings Dialog -->
    <Dialog v-model:open="showSettingsDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Configure suas preferências de áudio e interface.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Modelo de IA</Label>
            <Select
              :model-value="app.model"
              @update:model-value="
                (value) => {
                  if (value) {
                    app.setModel(value);
                  }
                }
              "
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="model in availableModels"
                  :key="model.id"
                  :value="model.id"
                >
                  {{ model.id }} ({{ model.provider || model.owned_by }})
                </SelectItem>
                <SelectItem v-if="loadingModels" value="" disabled>
                  Carregando modelos...
                </SelectItem>
                <SelectItem
                  v-if="!loadingModels && availableModels.length === 0"
                  value=""
                  disabled
                >
                  Nenhum modelo disponível
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-sm text-muted-foreground">
              Escolha qual modelo de IA usar para gerar as respostas
            </p>
          </div>
          <AudioSettings />
        </div>
      </DialogContent>
    </Dialog>

    <!-- Command Palette -->
    <ChatCommand
      :is-open="showCommandPalette"
      @clear-chat="clearMessages"
      @show-updates="handleShowUpdates"
      @show-settings="handleShowSettings"
      @quick-tip="handleQuickTip"
      @show-about="showAboutDialog = true"
      @open-github="handleOpenGitHub"
      @close="showCommandPalette = false"
    />
  </main>
  <!-- </ToastProvider> -->
</template>

<script setup lang="ts">
// Imports
import { useAppStore } from "~/store/app";
import { useClientStore } from "~/store/client";
import { useAudioStore } from "~/store/audio";
import type { User } from "~/types";
import { useChatCompletion } from "~/service/ai-provider";
import { postTextToSpeech } from "~/service/elevenlabs";
import type { IChatMessage } from "~/components/chat/ChatMessage.vue";
import { useToast } from "~/composables/useToast";
import { getApiUrl } from "~/lib/api-config";

// Component imports
import ChatHeader from "~/components/chat/ChatHeader.vue";
// import ChatSidebar from "~/components/chat/ChatSidebar.vue";
import WelcomeCard from "~/components/chat/WelcomeCard.vue";
import ChatMessage from "~/components/chat/ChatMessage.vue";
import ChatInput from "~/components/chat/ChatInput.vue";
import ChatCommand from "~/components/chat/ChatCommand.vue";
import AudioSettings from "~/components/ui/AudioSettings.vue";

// UI Components
import Dialog from "~/components/ui/dialog/Dialog.vue";
import DialogContent from "~/components/ui/dialog/DialogContent.vue";
import DialogHeader from "~/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "~/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "~/components/ui/dialog/DialogDescription.vue";
import Select from "~/components/ui/select/Select.vue";
import SelectContent from "~/components/ui/select/SelectContent.vue";
import SelectItem from "~/components/ui/select/SelectItem.vue";
import SelectTrigger from "~/components/ui/select/SelectTrigger.vue";
import SelectValue from "~/components/ui/select/SelectValue.vue";
import Label from "~/components/ui/label/Label.vue";

// Stores
const app = useAppStore();
const client = useClientStore();
const audioStore = useAudioStore();
const { showSuccess, showError, showInfo } = useToast();

// Reactive state
const loadingMessage = ref(false);
const loadingAudio = ref(false);
const chatContainer = ref<HTMLDivElement>();
const responseStream = ref<IChatMessage[]>([]);
const showAboutDialog = ref(false);
const showSettingsDialog = ref(false);
const showCommandPalette = ref(false);
const availableModels = ref<
  Array<{ id: string; owned_by: string; provider?: string }>
>([]);
const loadingModels = ref(false);

// Detect mobile
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  fetchModels();
});

watch(showSettingsDialog, (isOpen) => {
  if (isOpen) {
    fetchModels();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Methods
const fetchModels = async () => {
  if (availableModels.value.length > 0) return;

  loadingModels.value = true;
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/v1/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      availableModels.value = data.data || [];

      if (availableModels.value.length > 0 && !app.model) {
        app.setModel(availableModels.value[0].id);
      }
    }
  } catch (error) {
    console.error("Error fetching models:", error);
    availableModels.value = [
      { id: "qwen/qwen3-4b", owned_by: "google", provider: "openai" },
      { id: "gpt-4o", owned_by: "openai", provider: "openai" },
      { id: "gemini-2.5-pro", owned_by: "google", provider: "gemini" },
      { id: "gpt-3.5-turbo", owned_by: "openai", provider: "openai" },
    ];
  } finally {
    loadingModels.value = false;
  }
};

const fetchGit = () => {
  app.setLoading(true);
  return new Promise((resolve, reject) => {
    fetch("https://api.github.com/users/gaqno", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        client.$patch({
          user: {
            ...(data as User),
          },
        });
        app.setLoading(false);
        resolve(data);
      })
      .catch((err) => reject(err));
  });
};

const ask = (questionText: string) => {
  const buildHistory = (): Array<{
    role: "user" | "assistant";
    content: string;
  }> => {
    const history: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const msg of responseStream.value) {
      if (msg.role === "user") {
        history.push({ role: "user", content: msg.data });
      } else if (msg.role === "sys") {
        history.push({ role: "assistant", content: msg.data });
      }
    }

    return history;
  };

  const history = buildHistory();
  responseStream.value.push({ data: questionText, role: "user" });

  loadingMessage.value = true;
  app.setLoading(true);

  if (audioStore.notificationsEnabled) {
    showInfo("Pergunta enviada", "Processando sua pergunta...");
  }

  useChatCompletion(questionText, app.model, history)
    .then((data: any) => {
      const { message } = data;
      loadingMessage.value = false;
      loadingAudio.value = true;
      responseStream.value.push({ data: message.content, role: "sys" });
      responseStream.value.push({ data: "mdi:loading", role: "loading" });
      app.setLoading(false);

      if (audioStore.generateAudio) {
        postTextToSpeech({
          headers: ["audio/mpeg"],
          params: {
            optimize_streaming_latency: 0,
            output_format: "mp3_44100_128",
          },
          payload: {
            text: data.message.content || "",
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0,
              similarity_boost: 0,
              style: 0,
              use_speaker_boost: true,
            },
          },
        })
          .then((audio) => {
            responseStream.value.pop();
            const audioBlob = new Blob([audio], { type: "audio/mpeg" });
            const audioUrl = URL.createObjectURL(audioBlob);
            responseStream.value.push({ data: audioUrl, role: "audio" });
            loadingAudio.value = false;

            if (audioStore.notificationsEnabled) {
              showSuccess("Resposta completa", "Áudio gerado com sucesso!");
            }
          })
          .catch((err: any) => {
            loadingAudio.value = false;
            responseStream.value.pop();

            const errorMessage =
              err instanceof Error
                ? err.message
                : "Aparentemente a maquina do estado capitalista nos limitou ao dar voz a razão.. Transcrição por áudio mal-sucedida";

            responseStream.value.push({
              data: errorMessage,
              role: "warn",
            });

            if (audioStore.notificationsEnabled) {
              const errorTitle =
                err?.statusCode === 429
                  ? "Limite de requisições"
                  : "Erro no áudio";
              showError(errorTitle, errorMessage);
            }
          });
      } else {
        responseStream.value.pop();
        loadingAudio.value = false;
        if (audioStore.notificationsEnabled) {
          showSuccess("Resposta completa", "Resposta processada com sucesso!");
        }
      }
    })
    .catch((err: any) => {
      loadingMessage.value = false;
      loadingAudio.value = false;
      app.setLoading(false);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Falha ao processar sua pergunta. Tente novamente.";

      responseStream.value.push({
        data: errorMessage,
        role: "warn",
      });

      if (audioStore.notificationsEnabled) {
        const errorTitle =
          err?.statusCode === 429 ? "Limite de requisições" : "Erro";
        showError(errorTitle, errorMessage);
      }
    });
};

const handleTips = (text: string) => {
  ask(text);
};

const handleQuickTip = (tip: string) => {
  ask(tip);
};

const handleShowUpdates = () => {
  showInfo("Atualizações", "Versão mais recente do Lenin GPT");
};

const handleShowSettings = () => {
  showSettingsDialog.value = true;
};

const handleOpenGitHub = () => {
  window.open("https://www.github.com/gaqno", "_blank");
};

const clearMessages = () => {
  responseStream.value = [];

  if (audioStore.notificationsEnabled) {
    showInfo("Mensagens limpas", "Todas as mensagens foram removidas");
  }
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Cmd/Ctrl + K to open command palette
  if ((event.metaKey || event.ctrlKey) && event.key === "k") {
    event.preventDefault();
    showCommandPalette.value = true;
  }

  // Cmd/Ctrl + L to clear chat
  if ((event.metaKey || event.ctrlKey) && event.key === "l") {
    event.preventDefault();
    clearMessages();
  }
};

// Watchers
watchEffect(() => {
  if (responseStream.value && responseStream.value.length > 0) {
    nextTick(() => {
      // Scroll the chat container to bottom
      const chatContainer = document.querySelector(".overflow-y-auto");
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }
});

// Lifecycle
onMounted(() => {
  document.title = "LeninGPT";
  document.addEventListener("keydown", handleKeydown);

  // Apply dark mode by default
  const { isDark } = useTheme();
  if (!isDark.value) {
    // Toggle to dark mode if not already dark
    const { toggleTheme } = useTheme();
    toggleTheme();
  }

  // Enable autoplay by adding a click listener to the document
  const enableAutoplay = () => {
    // This enables autoplay for future audio elements
    document.removeEventListener("click", enableAutoplay);
    document.removeEventListener("touchstart", enableAutoplay);
  };

  document.addEventListener("click", enableAutoplay);
  document.addEventListener("touchstart", enableAutoplay);

  Promise.all([fetchGit()]);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
