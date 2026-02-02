<template>
  <div>
    <!-- Trigger Button -->
    <Button
      variant="ghost"
      size="icon"
      class="fixed bottom-4 right-4 z-50"
      @click="isOpenComputed = true"
    >
      <Icon name="mdi:information-outline" class="h-5 w-5" />
    </Button>

    <!-- Simple Modal -->
    <div
      v-if="isOpenComputed"
      class="fixed bottom-20 right-4 z-[300] bg-background border rounded-lg shadow-lg w-80 p-4"
    >
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="font-semibold text-lg">Informações do LeninGPT</h3>
          <p class="text-sm text-muted-foreground">
            Sobre esta aplicação e como usá-la
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          @click="closeDialog"
        >
          <Icon name="mdi:close" class="h-4 w-4" />
        </Button>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <h4 class="font-semibold">Como usar:</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Digite suas perguntas no campo de texto</li>
            <li>• Pressione Enter ou clique no botão enviar</li>
            <li>• Use Cmd/Ctrl + K para abrir o comando rápido</li>
            <li>• Use Cmd/Ctrl + L para limpar a conversa</li>
          </ul>
        </div>

        <Separator />

        <div class="space-y-2">
          <h4 class="font-semibold">Tecnologias:</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Vue 3 + Nuxt 3</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• OpenAI API</li>
            <li>• TTS (gaqno-ai-service)</li>
          </ul>
        </div>

        <Separator />

        <div class="space-y-2">
          <h4 class="font-semibold">Desenvolvedor:</h4>
          <p class="text-sm text-muted-foreground">
            Gabriel Aquino - Revolucionário dedicado
          </p>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="openGitHub">
              <Icon name="mdi:github" class="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" @click="openDonation">
              <Icon name="mdi:heart" class="h-4 w-4 mr-2" />
              Doar
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Computed property for v-model compatibility
const isOpenComputed = ref(false);

const closeDialog = () => {
  isOpenComputed.value = false;
};

const openGitHub = () => {
  window.open("https://www.github.com/gaqno", "_blank");
};

const openDonation = () => {
  window.open("https://www.buymeacoffee.com/gaqno", "_blank");
};
</script>
