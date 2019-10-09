/**
 * StatelessComponent.ts
 * @author Diao Zheng
 * @file Defines a stateless component.
 * @ignore_test
 */

import { Component } from "./Component";

/**
 * @deprecated Use `Component<TProp>` instead
 */
export class StatelessComponent<TProp>
extends Component<TProp, {}, never, never> {

}
