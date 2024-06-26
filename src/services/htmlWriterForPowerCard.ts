/* eslint-disable no-param-reassign,  import/extensions, prefer-template, class-methods-use-this, lit-a11y/click-events-have-key-events, lines-between-class-members */
import { html, TemplateResult } from 'lit-element';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { SensorElement } from '../models/SensorElement';
import { TeslaStyleSolarPowerCard } from '../TeslaStyleSolarPowerCard';

export class HtmlWriterForPowerCard {
  private teslaCard: TeslaStyleSolarPowerCard;

  private solarCardElements: Map<string, SensorElement>;

  private pxRate: number;

  private hass: HomeAssistant;

  public constructor(teslaCard: TeslaStyleSolarPowerCard, hass: HomeAssistant) {
    this.teslaCard = teslaCard;
    this.solarCardElements = teslaCard.solarCardElements;
    this.pxRate = teslaCard.pxRate;
    this.hass = hass;
  }

  public writeBubbleDiv(
    mainValue: number,
    mainUnitOfMeasurement: string | undefined,
    cssSelector: string,
    icon: string,
    bubblClickEntitySlot: string | null = null,
    bubblClickEntitySlotHassState: HassEntity | null = null,
    extraValue: string | null = null,
    extraUnitOfMeasurement: string | null = null
  ): TemplateResult {
    const entityActive = mainValue !== 0 ? bubblClickEntitySlot + '-active' : '';
    return html` <div class="acc_td ${cssSelector}">
      <div
        class="acc_container ${bubblClickEntitySlot} ${entityActive}"
        style="${'width:' + 9 * this.pxRate + 'px; height: ' + 9 * this.pxRate + 'px; padding:' + 5 * this.pxRate + 'px;'}"
        @click="${() => this._handleClick(bubblClickEntitySlotHassState)}"
      >
        ${
          extraValue !== null
            ? html`
                <ha-icon class="acc_icon" icon="${icon}"></ha-icon>
                <div
                  class="acc_text"
                  style="font-size:${3 * this.pxRate + 'px'}; margin-left: -2px; margin-top:${-0.5 * this.pxRate + 'px'}; width: ${10 *
                    this.pxRate +
                  'px'}"
                >
                  ${mainValue} ${mainUnitOfMeasurement}
                </div>
                <div class="acc_text_extra" style="width: ${10 * this.pxRate + 'px'}">${extraValue}${extraUnitOfMeasurement}</div>
              `
            : html`
                <ha-icon class="ha-icon-top" icon="${icon}"></ha-icon>
                <div
                  class="acc_text"
                  style="font-size:${3 * this.pxRate + 'px'}; margin-left: -2px; margin-top:${-0.5 * this.pxRate + 'px'}; width: ${10 *
                    this.pxRate +
                  'px'}"
                >
                  ${mainValue} ${mainUnitOfMeasurement}
                </div>
              `
        }
        </div>
      </div>
    </div>`;
  }

  public writeBatteryBubbleDiv(
    mainValue: number,
    mainUnitOfMeasurement: string | undefined,
    cssSelector: string,
    icon: string,
    bubblClickEntitySlot: string | null,
    bubblClickEntitySlotHassState: HassEntity | null,
    extraValue: string | undefined = undefined,
    extraUnitOfMeasurement: string | undefined = undefined
  ): TemplateResult {
    if (extraValue !== undefined) {
      if (icon === 'mdi:battery-medium' || icon === 'mdi:battery') {
        icon = this.getBatteryIcon(parseFloat(extraValue), mainValue);
      }
    }
    return this.writeBubbleDiv(
      mainValue,
      mainUnitOfMeasurement,
      cssSelector,
      icon,
      bubblClickEntitySlot,
      bubblClickEntitySlotHassState,
      extraValue,
      extraUnitOfMeasurement
    );
  }

  private getBatteryIcon(batteryValue: number, batteryChargeDischargeValue: number) {
    const TempSocValue = batteryValue;
    // if (batteryValue <= 5) TempSocValue = 0;

    const batteryStateRoundedValue = TempSocValue; // Math.floor(TempSocValue / 10) * 10;
    let batteryStateIconString = ''; // '-' + batteryStateRoundedValue.toString();

    if (batteryStateRoundedValue >= 90) {
      batteryStateIconString = '-high';
    } else if (batteryStateRoundedValue > 50 && batteryStateRoundedValue <= 90) {
      batteryStateIconString = '-medium';
    } else if (batteryStateRoundedValue > 10 && batteryStateRoundedValue <= 50) {
      batteryStateIconString = '-low';
    } else {
      batteryStateIconString = '-outline'; // empty
    }

    // show charging icon beside battery state
    let batteryCharging: string = '-charging';
    if (batteryChargeDischargeValue <= 0) {
      batteryCharging = '';
    }

    return 'mdi:battery' + batteryCharging + batteryStateIconString;
  }

  public writeAppliancePowerLineAndCircle(applianceNumber: number, pathDAttribute: string) {
    const divEntity = this.solarCardElements.get('appliance' + applianceNumber + '_consumption_entity');
    if (divEntity == null) return html``;
    const height = 12;
    let verticalPosition: string;
    if (applianceNumber === 1) {
      verticalPosition = 'top:' + 22.5 * this.pxRate + 'px;';
    } else {
      verticalPosition = 'bottom:' + 15 * this.pxRate + 'px;';
    }
    return html` <div
      class="acc_line acc_appliance${applianceNumber}_line"
      style="
        height:${height * this.pxRate - (applianceNumber - 1) * 5 + 'px'}
        width:10px};
        right:${9.5 * this.pxRate + 10 + 'px'};
        ${verticalPosition}
        position:absolute"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="${'0 0 ' + (12 * this.pxRate - (applianceNumber - 1) * 5) + ' ' + (12 * this.pxRate - (applianceNumber - 1) * 5)}"
        preserveAspectRatio="xMinYMax slice"
        style="height:${height * this.pxRate - (applianceNumber - 1) * 5 + 'px'};width:10px}"
        class="acc_appliance${applianceNumber}_line_svg"
      >
        ${this.writeCircleAndLine('appliance' + applianceNumber + '_consumption_entity', pathDAttribute)}
      </svg>
    </div>`;
  }

  public writeCircleAndLine(sensorName: string, pathDAttribute: string) {
    const entity = this.solarCardElements.get(sensorName);
    if (entity == null) return html``;
    return html`<svg>
      <circle r="4" cx="${entity.startPosition.toString()}" cy="4" fill="${entity.color}" id="${sensorName + '_circle'}"></circle>
      <path d="${pathDAttribute}" id="${sensorName + '_line'}"></path>
    </svg>`;
  }

  private _handleClick(stateObj: HassEntity | null) {
    if (stateObj == null) return;
    const event = <any>new Event('hass-more-info', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    event.detail = { entityId: stateObj.entity_id };
    if (this.teslaCard.shadowRoot == null) return;
    this.teslaCard.shadowRoot.dispatchEvent(event);
  }
}
