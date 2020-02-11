/**
 * ActivationCode.ts
 * @author My M1 App Team
 * @file Defines an Activation Code as of SGP 22 v2.2 section 4.1
 */

import { Compare, Option } from "nasi-lemak";

const DELIMITER = "$";

export class ActivationCode {

  public static parse(activationCode: string): Option.Type<ActivationCode> {
    const sanitised = activationCode.replace(/^LPA:/, "");
    const sections = sanitised.split(DELIMITER, 5);

    if (!Compare.strEq("1", sections[0])) {
      return undefined;
    }

    if (sections.length === 5 && !Compare.strEq("1", sections[4])) {
      return undefined;
    }

    const smdpAddress = sections[1];
    const matchingId = sections[2];
    const oid = Option.truthy(sections.length > 3 ? sections[3] : undefined);
    const confirmationCodeRequired = sections.length === 5;

    return new ActivationCode(
      smdpAddress,
      matchingId,
      oid,
      confirmationCodeRequired,
    );
  }

  public readonly format: string = "1";
  public readonly smdpAddress: string;
  public readonly matchingId: string;
  public readonly oid?: string;
  public readonly confirmationCodeRequired: boolean = false;
  public iccid?: string;
  public confirmationCode?: string;
  public eid?: string;

  constructor(
    smdpAddress: string,
    matchingId: string,
    oid?: string,
    confirmationCodeRequired?: boolean,
  ) {
    this.smdpAddress = smdpAddress;
    this.matchingId = matchingId;
    this.oid = oid;
    this.confirmationCodeRequired = confirmationCodeRequired ?? false;
  }

  private formatCompulsoryFields() {
    return [ this.format, this.smdpAddress, this.matchingId ].join(DELIMITER);
  }

  private attach(value?: string) {
    return Option.mapChoice(value, (v) => DELIMITER + v, "");
  }

  public get activationCode() {
    return (
      this.formatCompulsoryFields() +
      this.attach(this.oid) +
      this.attach(this.confirmationCodeRequired ? "1" : undefined)
    );
  }

  public get activationCodeForQR() {
    return `LPA:${this.activationCode}`;
  }

}
