import watermarkLogo from '../../Publico/Imagens/Decoracao/logo-amazon-max.png';

export interface WatermarkedFile {
  file: File;
  url: string;
}

export function triggerFileUpload(proxy: any) {
  if (proxy?.$refs?.foto && proxy.$refs.foto instanceof HTMLInputElement) {
    proxy.$refs.foto.click();
  } else {
    proxy?.$toast.error("Erro ao acessar o campo de upload de fotos.");
  }
}

export function addWatermark(file: File): Promise<WatermarkedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);

        const watermark = new Image();
        watermark.onload = async () => {
          const scale = 0.7;
          const wW = img.width * scale;
          const wH = (watermark.height / watermark.width) * wW;
          const x = (img.width - wW) / 2;
          const y = (img.height - wH) / 2;

          ctx.globalAlpha = 0.6;
          ctx.drawImage(watermark, x, y, wW, wH);
          ctx.globalAlpha = 1.0;

          const dataUrl = canvas.toDataURL('image/png');

          try {
            const blob = await (await fetch(dataUrl)).blob();
            const watermarkedFile = new File([blob], file.name, { type: 'image/png' });
            resolve({ file: watermarkedFile, url: dataUrl });
          } catch (err) {
            reject(err);
          }
        };
        watermark.onerror = reject;
        watermark.src = watermarkLogo;
      };
      img.onerror = reject;
      if (ev.target?.result) {
        img.src = ev.target.result as string;
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function handleFileUpload(event: Event, state: any, proxy: any) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files?.length) {
    proxy?.$toast.error("Por favor, selecione uma foto.");
    return;
  }

  const currentPhotos = state.formularioProduto.foto || [];
  const availableSlots = 6 - currentPhotos.length;
  
  if (availableSlots <= 0) {
    proxy?.$toast.error("Limite máximo de 6 fotos atingido!");
    target.value = '';
    return;
  }

  const filesToProcess = Array.from(files).slice(0, availableSlots);
  
  if (files.length > availableSlots) {
    proxy?.$toast.warning(`Apenas ${availableSlots} foto(s) foram adicionadas (limite de 6)`);
  }

  const toastId = proxy?.$toast.info("Aplicando marca d'água...", { duration: 0 });
  
  try {
    const watermarked: WatermarkedFile[] = await Promise.all(
      filesToProcess.map((f: File) => addWatermark(f))
    );
    
    state.formularioProduto.foto = [
      ...currentPhotos,
      ...watermarked
    ];
    
    if (toastId && proxy?.$toast) proxy.$toast.clear();
    proxy?.$toast.success("Marca d'água aplicada!");
  } catch (e) {
    if (toastId && proxy?.$toast) proxy.$toast.clear();
    proxy?.$toast.error("Falha ao aplicar marca d'água.");
    console.error(e);
  } finally {
    target.value = '';
  }
}

export function removeImage(state: any, index: number, proxy: any): void {
  if (state.formularioProduto.foto && state.formularioProduto.foto.length > index) {
    state.formularioProduto.foto.splice(index, 1);
    proxy?.$toast.info("Imagem removida com sucesso.");
  } else {
    proxy?.$toast.error("Erro ao tentar remover a imagem.");
  }
}
