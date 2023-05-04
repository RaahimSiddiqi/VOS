export class RequestBuilder {
  private url: string;
  private method: string = "GET";
  private headers: Record<string, string> = {};
  private body: FormData | string | null = null;
  
  constructor(url : string){
    this.url = url;
  }
  
  withMethod(method: string): RequestBuilder {
    this.method = method;
    return this;
  }
  
  withAuth(accessToken: string): RequestBuilder {
    this.headers["Authorization"] = `Bearer ${accessToken}`;
    return this;
  }
  
  fromFormData(obj: Record<string, unknown>): RequestBuilder {
    const formData = new FormData();
    for (const key in obj) {
      formData.append(key, obj[key] as string);
    }
    this.body = formData;
    return this;
  }
  
  build(): Request {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    });
  }
}

export const download = (file: File) => {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
}
export const base64ToFile = (base64String : string, mimeType : string, fileName : string) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const type = mimeType.startsWith('video') ? 'video/mp4' : mimeType;
  const blob = new Blob([byteArray], { type });
  const file = new File([blob], fileName, { type });
  return file;
}