/**
 * Theme.ts
 * @author Diao Zheng
 * @file Mock implementation for Core/Theme module
 */

// Since we're not using NodeJS as our primary development environment, we will
// not make TypeScript actually recognise `module.exports` in a type-safe way.
// This is simply to produce an exported module that otherwise behaves
// identically to Theme.ts
declare var module: any;

const actual = jest.requireActual("../Theme");

module.exports = {
  ...actual,

  mockRemoveHandler: jest.fn(),

  mockSetHandler: jest.fn(),

  removeHandler(handlerId: number) {
    actual.removeHandler(handlerId);
    this.mockRemoveHandler(handlerId);
  },

  setHandler(handler: () => void) {
    const id = actual.setHandler(handler);
    this.mockSetHandler(handler);
    return id;
  },
};
