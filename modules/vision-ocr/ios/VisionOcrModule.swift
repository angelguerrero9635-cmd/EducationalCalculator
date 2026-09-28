import ExpoModulesCore
import Vision
import UIKit

/**
 * On-device text recognition with Apple's Vision framework. Reads the text of a photo the
 * student took or picked and returns it as lines, top to bottom. Nothing leaves the device:
 * the image is read once and released.
 */
public class VisionOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionOcr")

    AsyncFunction("recognize") { (uri: String, promise: Promise) in
      guard let url = URL(string: uri), let data = try? Data(contentsOf: url),
        let image = UIImage(data: data), let cgImage = image.cgImage
      else {
        promise.reject("E_IMAGE", "Could not read the picture.")
        return
      }
      let request = VNRecognizeTextRequest { request, error in
        if let error = error {
          promise.reject("E_VISION", error.localizedDescription)
          return
        }
        let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
        // Vision's boxes have their origin at the bottom left: sort from the top down, then left to right.
        let sorted = observations.sorted { a, b in
          let dy = a.boundingBox.midY - b.boundingBox.midY
          if abs(dy) > 0.015 { return dy > 0 }
          return a.boundingBox.minX < b.boundingBox.minX
        }
        let lines = sorted.compactMap { $0.topCandidates(1).first?.string }
        promise.resolve(lines.joined(separator: "\n"))
      }
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      request.recognitionLanguages = ["en-US"]
      let handler = VNImageRequestHandler(
        cgImage: cgImage, orientation: Self.orientation(image.imageOrientation), options: [:])
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try handler.perform([request])
        } catch {
          promise.reject("E_VISION", error.localizedDescription)
        }
      }
    }
  }

  private static func orientation(_ o: UIImage.Orientation) -> CGImagePropertyOrientation {
    switch o {
    case .up: return .up
    case .down: return .down
    case .left: return .left
    case .right: return .right
    case .upMirrored: return .upMirrored
    case .downMirrored: return .downMirrored
    case .leftMirrored: return .leftMirrored
    case .rightMirrored: return .rightMirrored
    @unknown default: return .up
    }
  }
}
