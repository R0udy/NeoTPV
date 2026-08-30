/**
 * Configuración centralizada de Microsoft OneDrive / Microsoft Graph API
 * 
 * TODO: Configurar credenciales de Azure App Registration para habilitar
 * la subida y sincronización directa con carpetas de OneDrive.
 */

export interface OneDriveConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
  baseFolderPath: string;
}

// TODO: Rellenar credenciales de Azure Active Directory cuando se implemente Graph
export const onedriveConfig: OneDriveConfig = {
  clientId: import.meta.env.VITE_ONEDRIVE_CLIENT_ID || "00000000-0000-0000-0000-000000000000",
  tenantId: import.meta.env.VITE_ONEDRIVE_TENANT_ID || "common",
  redirectUri: import.meta.env.VITE_ONEDRIVE_REDIRECT_URI || "http://localhost:3000/auth/onedrive",
  scopes: ["Files.ReadWrite.All", "User.Read"],
  baseFolderPath: "/StandEventos/ImagenesProductos"
};

/**
 * Normaliza y valida una URL de imagen (OneDrive, Imgur, Cloudinary o enlaces directos).
 * Transforma enlaces compartidos de OneDrive (1drv.ms o onedrive.live.com) a formato directo si es posible.
 */
export function formatImageUrl(rawUrl: string | undefined): string {
  if (!rawUrl || rawUrl.trim() === '') {
    return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80'; // Placeholder elegante de joyería
  }

  const url = rawUrl.trim();

  // Si es un enlace de OneDrive de tipo 'onedrive.live.com/redir?resid=...' convertir a 'download' si aplica
  if (url.includes('onedrive.live.com/view.aspx') || url.includes('onedrive.live.com/redir')) {
    try {
      const parsed = new URL(url);
      parsed.pathname = '/download';
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * TODO: Stub para subida de imágenes a OneDrive vía Microsoft Graph
 * Implementar cuando se configure la autenticación MSAL.
 */
export async function uploadImageToOneDriveStub(file: File): Promise<string> {
  console.info(`[OneDrive Stub] Subiendo archivo "${file.name}" a ${onedriveConfig.baseFolderPath}...`);
  // Simular subida devolviendo una URL basada en objeto local o placeholder
  return new Promise((resolve) => {
    setTimeout(() => {
      const simulatedUrl = `https://1drv.ms/u/s!SimulatedSharedLink_${encodeURIComponent(file.name)}?e=preview`;
      resolve(simulatedUrl);
    }, 800);
  });
}
