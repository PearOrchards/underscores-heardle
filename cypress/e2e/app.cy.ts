describe('Loading', () => {
    it ("should load", () => {
        cy.visit("http://localhost:5000/");

        cy.get('[data-cy="page-title"]').contains("heardle", { matchCase: false });
		
    })
})