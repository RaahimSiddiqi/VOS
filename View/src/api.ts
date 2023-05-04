import { RequestBuilder } from "./Utils";
import modelsInfo from './assets/models_info.json';
import { BackgroundInterface, InferenceParamsInterface } from "./components/Controller";
import { SERVER_IP, SERVER_PORT } from "./config";
import { base64ToFile } from "./Utils";
const PREDICT_ROUTE = `http://${SERVER_IP}:${SERVER_PORT}/predict`;
const EXTRACT_ROUTE = `http://${SERVER_IP}:${SERVER_PORT}/extract`;

export async function predict(media: File, inferenceParams: InferenceParamsInterface, accessToken: string) {
    const model_name = inferenceParams.model;
    const conf_thresh = inferenceParams.conf;
    const iou_thresh = inferenceParams.iou;
    const filter_classes = `[${(inferenceParams.classes.map(label => modelsInfo[model_name].indexOf(label))).join(', ')}]`;
    const file = media;
    const output_video_case = inferenceParams.showBoxes && inferenceParams.showConf && inferenceParams.showLabels ? 1 :
        !inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 2 :
            inferenceParams.showBoxes && !inferenceParams.showConf && !inferenceParams.showLabels ? 3 :
                4;

    const body = {model_name, output_video_case, file, conf_thresh, iou_thresh, filter_classes }
    console.log("predict body =>", body);


    const request = new RequestBuilder(PREDICT_ROUTE)
        .withMethod("POST")
        .fromFormData(body)
        .withAuth(accessToken)
        .build();
    
     try {
        const response = await fetch(request);
        const responseBodyParsed = await response.json();
        console.log(responseBodyParsed);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`, {cause : responseBodyParsed});
        }
        
        const output = {
            file : base64ToFile(responseBodyParsed['base64_encoded_string'],  responseBodyParsed['mime'], `segmented_${media.name}`),
            results : JSON.stringify(responseBodyParsed['results']),
            detectedClasses : responseBodyParsed['classes_detected'].map((item : any) => item[0])
        }

        return output;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

export async function extract(media: File, filterClasses : number[], results: string, background: BackgroundInterface, accessToken: string) {
    const file = media;
    const bg_image = background.file;
    const { r, g, b, a } = background.color;
    const filter_classes = `[${filterClasses.join(',')}]`;
    const color_code = `[${r},${g},${b},${Math.floor(a * 255)}]`;

    const body = { file, ...(bg_image ? { bg_image } : { color_code }), results, filter_classes };

    console.log("extract body =>", body);
    const request = new RequestBuilder(EXTRACT_ROUTE)
        .withMethod("POST")
        .fromFormData(body)
        .withAuth(accessToken)
        .build()

    try{
        const response = await fetch(request);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`, {cause : await response.json()});
        }

        const blob = await response.blob();
        return new File([blob], `extracted_${media.name}`, { type : request.headers.get('content-type')!});

    }catch (error : any) {
        console.error('An error occurred:', error, 'cause' in error && error.cause);
        throw error;
    }
}
