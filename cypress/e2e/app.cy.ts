describe('Loading', () => {
	beforeEach(() => {
		cy.visit("/");
	})
	
    it ("should have main content", () => {
        cy.get('[data-cy="page-title"]').contains("heardle", { matchCase: false });
		
		const boxes = cy.get("#attemptBoxes").children();
		boxes.should("have.length", 6);
		boxes.each(box => {
			cy.wrap(box).should("have.text", "");
		});
    })
	
	it ("should load player", () => {
		cy.get("[data-cy=innerTrack]").should("exist");
		cy.get("[data-cy=innerTrack] > [class*=active]").should("have.length", 1);
		cy.get("[data-cy=playerBtn] > svg").should("have.class", "fa-play");
	})
	
	it ("should load input", () => {
		cy.get("input[type=text]").should("exist");
	})
});

describe("Navbar functionality", () => {
	beforeEach(() => {
		cy.visit("/");
	});
	
	it ("should have a navbar", () => {
		cy.get("nav").should("exist");
		cy.get("nav").children().should("have.length", 3); // Left, center, right
		
		cy.get("nav").children().eq(0).children("svg").should("exist"); // At least one, in case a donate button is added
		// Center already checked
		cy.get("nav").children().eq(2).children("svg").should("have.length", 2);
	});
	
	it ("should successfully display and close every modal", () => {
		cy.get("nav > div > svg").each((icon) => {
			cy.wrap(icon).click();
			cy.get("[class*=dialog_modal]:modal[open]").should("exist");
			cy.get("[class*=dialog_modal]:modal[open] > svg.fa-xmark").click();
			cy.get("[class*=dialog_modal]:modal[open]").should("not.exist");
			
			cy.wrap(icon).click();
			cy.get("[class*=dialog_modal]:modal[open]").should("exist");
			// Cannot use type because silly
			cy.get("body").trigger("keydown", { key: "Escape" });
			cy.get("body").trigger("keyup", { key: "Escape" });
			cy.get("[class*=dialog_modal]:modal[open]").should("not.exist");
		})
	});
})