/**
 * StatusCode.ts
 * @author Diao Zheng
 * @file HTTP status code enum
 * refer to:
 *  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 *  - https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 * @barrel export isError, isClientError, isServerError, getStatusString
 * @ignore_test
 */

export enum StatusCode {
  // Information responses
  Continue = 100,
  SwitchingProtocol = 101,
  WebDAV_Processing = 102,
  EarlyHints = 103,
  Nonstandard_Proposal_Checkpoint = 103,

  // Successful responses
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 203,
  ResetContent = 205,
  PartialContent = 206,
  WebDAV_MultiStatus = 207,
  WebDAV_AlreadyReported = 208,
  Nonstandard_Apache_ThisIsFine = 218,
  HttpDelta_IMUsed = 226,

  // Redirection messages
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  Deprecated_UseProxy = 305,
  __internal_unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  // Client error responses
  BadRequest = 400,
  Unauthorized = 401,
  Experimental_PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  URITooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  Nonstandard_Laravel_PageExpired = 419,
  Nonstandard_Spring_MethodFailure = 420,
  Nonstandard_Twitter_EnhanceYourCalm = 420,
  MisdirectedRequest = 421,
  WebDAV_UnprocessableEntity = 422,
  WebDAV_Locked = 423,
  WebDAV_FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  Nonstandard_MicrosoftIIS_LoginTimeout = 440,
  Nonstandard_Nginx_NoResponse = 444,
  Nonstandard_MicrosoftIIS_RetryWith = 449,
  Nonstandard_Microsoft_BlockedByWindowsParentalControls = 450,
  UnavailableForLegalReasons = 451,
  Nonstandard_MicrosoftIIS_Redirect = 451,
  Nonstandard_Nginx_RequestHeaderTooLarge = 494,
  Nonstandard_Nginx_SSLCertificateError = 495,
  Nonstandard_Nginx_SSLCertificateRequired = 496,
  Nonstandard_Nginx_HTTPRequestSentToHTTPSPort = 497,
  Nonstandard_ArcGIS_InvalidToken = 498,
  Nonstandard_ArcGIS_TokenRequired = 499,
  Nonstandard_Nginx_ClientClosedRequest = 499,

  // server error responses
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 504,
  VariantAlsoNegotiates = 506,
  WebDAV_InsufficientStorage = 507,
  WebDAV_LoopDetected = 508,
  Nonstandard_Apache_BandwidthLimitExceeded = 509,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
  Nonstandard_Cloudflare_UnknownError = 520,
  Nonstandard_Cloudflare_WebServerIsDown = 521,
  Nonstandard_Cloudflare_ConnectionTimedOut = 522,
  Nonstandard_Cloudflare_OriginIsUnreachable = 523,
  Nonstandard_Cloudflare_ATimeoutOccured = 524,
  Nonstandard_Cloudflare_InvalidSSLCertificate = 526,
  Nonstandard_Cloudflare_RailgunError = 527,
  Nonstandard_Pantheon_SiteIsFrozen = 530,
  Nonstandard_Cloudflare_OriginDNSError = 530,
  Nonstandard_NetworkReadTimeoutError = 598,
}

export function isError(code: StatusCode): boolean {
  return (code >= 400 && code < 600);
}

export function isClientError(code: StatusCode): boolean {
  return (code >= 400 && code < 500);
}

export function isServerError(code: StatusCode): boolean {
  return (code >= 500 && code < 600);
}

export function getStatusString(code: StatusCode): string {
  switch (code) {
    case StatusCode.Continue:
      return "Continue";
    case StatusCode.SwitchingProtocol:
      return "Switching Protocol";
    case StatusCode.WebDAV_Processing:
      return "Processing";
    case StatusCode.EarlyHints:
      return "Early Hints";
    case StatusCode.Ok:
      return "OK";
    case StatusCode.Created:
      return "Created";
    case StatusCode.Accepted:
      return "Accepted";
    case StatusCode.NonAuthoritativeInformation:
      return "Non-Authoritative Information";
    case StatusCode.NoContent:
      return "No Content";
    case StatusCode.ResetContent:
      return "Reset Content";
    case StatusCode.PartialContent:
      return "PartialContent";
    case StatusCode.WebDAV_MultiStatus:
      return "Multi-Status";
    case StatusCode.WebDAV_AlreadyReported:
      return "Already Reported";
    case StatusCode.HttpDelta_IMUsed:
      return "IM Used";

    case StatusCode.MultipleChoices:
      return "Multiple Choices";
    case StatusCode.MovedPermanently:
      return "Moved Permanently";
    case StatusCode.Found:
      return "Found";
    case StatusCode.SeeOther:
      return "See Other";
    case StatusCode.NotModified:
      return "Not Modified";
    case StatusCode.Deprecated_UseProxy:
      return "Use Proxy";
    case StatusCode.__internal_unused:
      return "unused (previously Switch Proxy)";
    case StatusCode.TemporaryRedirect:
      return "Temporary Redirect";
    case StatusCode.PermanentRedirect:
      return "Permanent Redirect";

    case StatusCode.BadRequest:
      return "Bad Request";
    case StatusCode.Unauthorized:
      return "Unauthorized";
    case StatusCode.Experimental_PaymentRequired:
      return "Payment Required";
    case StatusCode.Forbidden:
      return "Forbidden";
    case StatusCode.NotFound:
      return "Not Found";
    case StatusCode.MethodNotAllowed:
      return "Method Not Allowed";
    case StatusCode.NotAcceptable:
      return "Not Acceptable";
    case StatusCode.ProxyAuthenticationRequired:
      return "Proxy Authentication Required";
    case StatusCode.RequestTimeout:
      return "Request Timeout";
    case StatusCode.Conflict:
      return "Conflict";
    case StatusCode.Gone:
      return "Gone";
    case StatusCode.LengthRequired:
      return "Length Required";
    case StatusCode.PreconditionFailed:
      return "Precondition Failed";
    case StatusCode.PayloadTooLarge:
      return "Payload Too Large";
    case StatusCode.URITooLong:
      return "URI Too Long";
    case StatusCode.UnsupportedMediaType:
      return "Unsupported Media Type";
    case StatusCode.RangeNotSatisfiable:
      return "Range Not Satisfiable";
    case StatusCode.ExpectationFailed:
      return "Expectation Failed";
    case StatusCode.ImATeapot:
      return "I'm a teapot";
    case StatusCode.MisdirectedRequest:
      return "Misdirected Request";
    case StatusCode.WebDAV_UnprocessableEntity:
      return "Unprocessable Entity";
    case StatusCode.WebDAV_Locked:
      return "Locked";
    case StatusCode.WebDAV_FailedDependency:
      return "Failed Dependency";
    case StatusCode.TooEarly:
      return "Too Early";
    case StatusCode.UpgradeRequired:
      return "Upgrade Required";
    case StatusCode.PreconditionRequired:
      return "Precondition Required";
    case StatusCode.TooManyRequests:
      return "Too Many Requests";
    case StatusCode.RequestHeaderFieldsTooLarge:
      return "Request Header Fields Too Large";
    case StatusCode.UnavailableForLegalReasons:
      return "Unavailable For Legal Reasons";

    case StatusCode.InternalServerError:
      return "Internal Server Error";
    case StatusCode.NotImplemented:
      return "Not Implemented";
    case StatusCode.BadGateway:
      return "Bad Gateway";
    case StatusCode.ServiceUnavailable:
      return "Service Unavailable";
    case StatusCode.GatewayTimeout:
      return "Gateway Timeout";
    case StatusCode.HTTPVersionNotSupported:
      return "HTTP Version Not Supported";
    case StatusCode.VariantAlsoNegotiates:
      return "Variant Also Negotiates";
    case StatusCode.WebDAV_InsufficientStorage:
      return "Insufficient Storage";
    case StatusCode.WebDAV_LoopDetected:
      return "Loop Detected";
    case StatusCode.NotExtended:
      return "Not Extended";
    case StatusCode.NetworkAuthenticationRequired:
      return "Network Authentication Required";

    default:
      return `HTTP ${code}`;
  }
}
