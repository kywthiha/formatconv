/// <reference types="cypress" />

context("Actions", () => {
  beforeEach(() => {
    cy.visit("http://127.0.0.1:5173/signin");
  });

  // https://on.cypress.io/interacting-with-elements

  it(".type() - type into a DOM element", () => {
    // https://on.cypress.io/type
    cy.get("[type=text]").type(`kyawthiha.dev@gmail.com`);
    cy.get("[type=password]").type(`kyawthiha.dev@gmail.com`);
    [...Array(1000).keys()].forEach(async () => {
      cy.get(".sign-in button").click();
    });
  });
});
