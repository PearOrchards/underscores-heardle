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
		cy.get("[data-cy=innerTrack] > [data-active=true]").should("have.length", 1);
		cy.get("[data-cy=playerBtn] > svg", { timeout: 30000 }).should("have.class", "lucide-play");
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
		cy.wait(100); // Wait until it's loaded...
		cy.get("nav > div > svg").each((icon) => {
			cy.wrap(icon).click();
			cy.get("[data-slot=dialog-content][data-state=open]").should("exist");
			cy.get("[data-slot=dialog-content][data-state=open] [data-slot=dialog-close]").click();
			cy.get("[data-slot=dialog-content][data-state=open]").should("not.exist");

			cy.wrap(icon).click();
			cy.get("[data-slot=dialog-content][data-state=open]").should("exist");
			// Radix closes the dialog on Escape
			cy.get("body").type("{esc}");
			cy.get("[data-slot=dialog-content][data-state=open]").should("not.exist");
		})
	});
})

/**
 * Helper function to skip songs, and check if the player is playing or not. Checks halfway it is still playing.
 * @param times The number of times to skip
 * @param expectedTime The expected time to play (seconds)
 * @returns void
 */
function skip(times: number, expectedTime: number): void {
	for (let i = 0; i < times; i++) {
		cy.get("[data-cy=skipBtn]").click();
	}

	// Each skip refetches a longer audio clip, so wait until the player is ready again.
	// Hope your internet is good! The reason this was added now is because mine's not!!!
	cy.get("[data-cy=playerBtn] > svg", { timeout: 30000 }).should("have.class", "lucide-play");
	cy.get("[data-cy=playerBtn]").click();
	cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-square");
	cy.wait(expectedTime  / 2 * 1000);
	cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-square");
	cy.wait(expectedTime / 2 * 1000);
	cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-play");
}


describe("Player functionality", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.get("[data-cy=playerBtn] > svg", { timeout: 30000 }).should("have.class", "lucide-play"); // Wait until ready
	})

	it ("should play and stop on click", () => {
		cy.get("[data-cy=playerBtn]").click();
		cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-square");
		cy.get("[data-cy=playerBtn]").click();
		cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-play");
	});

	it ("should automatically stop after limit", () => {
		cy.get("[data-cy=playerBtn]").click();
		cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-square");
		cy.wait(1200);
		cy.get("[data-cy=playerBtn] > svg").should("have.class", "lucide-play");
	})

	describe ("should increase time after every incorrect guess", () => {
		it ("two seconds", () => skip(1, 2));
		it ("four seconds", () => skip(2, 4));
		it ("eight seconds", () => skip(3, 8));
		it ("sixteen seconds", () => skip(4, 16));
		it ("thirty-two seconds", () => skip(5, 32));
	});

	it ("should autoplay on completion", () => {
		for (let i = 0; i < 6; i++) {
			cy.get("[data-cy=skipBtn]").click();
		}
		cy.get("[data-cy=complete]", { timeout: 30000 });
		cy.get("[data-cy=playerBtn] > svg", { timeout: 30000 }).should("have.class", "lucide-square");
	})

	it ("should not autoplay on completion after reloading the page", () => {
		for (let i = 0; i < 6; i++) {
			cy.get("[data-cy=skipBtn]").click();
		}
		// Wait for the game to actually complete before reloading: gameComplete()
		// awaits a server action and only then persists the answer to localStorage.
		// Reloading before that means doNotAutoplay never gets set, so it autoplays.
		cy.get("[data-cy=complete]", { timeout: 30000 });
		cy.reload();
		cy.get("[data-cy=complete]", { timeout: 30000 });
		cy.get("[data-cy=playerBtn] > svg", { timeout: 30000 }).should("have.class", "lucide-play");
	});
});

describe("Input functionality", () => {
	beforeEach(() => {
		cy.visit("/");
	})

	it("should not allow empty input", () => {
		cy.get('[data-cy="textInput"]').type("{enter}");
		cy.get('#attemptBoxes > :nth-child(1)').should("have.text", "");
	})

	it("should not allow gibberish input", () => {
		cy.get('[data-cy="textInput"]').type("ashgvd{enter}");
		cy.get('#attemptBoxes > :nth-child(1)').should("have.text", "");
	});

	it("should accept valid input", () => {
		cy.get('[data-cy="textInput"]').click();
		cy.wait(100);
		cy.get('[data-cy="textInput"]').type("a");
		cy.get('[data-cy=suggestions] > p').first().click();
		cy.get('[data-cy="textInput"]').type("{enter}");
		cy.get('#attemptBoxes > :nth-child(1)').should("not.have.text", "");
	});

	it("should complete the game when the correct answer is guessed", () => {
		// "underscores & acaer - cradlesong" is the mocked answer (see cypress/support/e2e.ts).
		cy.get('[data-cy="textInput"]').click();
		cy.wait(100);
		cy.get('[data-cy="textInput"]').type("cradlesong");
		cy.get('[data-cy=suggestions] > p', { timeout: 20000 }).first().click();
		cy.get('[data-cy="textInput"]').should("have.value", "underscores & acaer - cradlesong");
		cy.get('[data-cy=submitBtn]').click();
		cy.get('[data-cy=complete]', { timeout: 30000 }).should("exist");
	});

	describe('using suggestions', () => {
		beforeEach(() => {
			cy.get('[data-cy="textInput"]').click();
			cy.wait(100);
			cy.get('[data-cy="textInput"]').type("a");
			// Wait for the SongSuggestions server action to resolve so each test starts with the list loaded.
			cy.get('[data-cy=suggestions] > p', { timeout: 20000 }).should("have.length.greaterThan", 0);
		});

		it("should present suggestions on input", () => {
			cy.get('[data-cy=suggestions]').should("be.visible");
			cy.get('[data-cy=suggestions] > p').should("have.length.greaterThan", 0);
		});


		it("should select a suggestion by using mouse only", () => {
			cy.get('[data-cy=suggestions] > p').first().invoke("text")
				.then((suggestionText) => {
					cy.get('[data-cy=suggestions] > p').first().click();
					cy.get('[data-cy="textInput"]').should("have.value", suggestionText);
				});
		});

		it("should select a suggestion by using keyboard only", () => {
			cy.get('[data-cy=suggestions] > p').last().invoke("text")
				.then((suggestionText) => {
					cy.get('[data-cy="textInput"]').type("{uparrow}");
					cy.get('[data-cy="textInput"]').type("{enter}");
					cy.get('[data-cy="textInput"]').should("have.value", suggestionText);
				})
		});

		it("should select a suggestion by hovering first with mouse, then using keyboard", () => {
			cy.get('[data-cy=suggestions] > p').first().next().invoke("text")
				.then((suggestionText) => {
					cy.get('[data-cy=suggestions] > p').first().trigger("mouseover", "center");
					cy.wait(100);
					cy.get('[data-cy="textInput"]').type("{downarrow}");
					cy.wait(100);
					cy.get('[data-cy="textInput"]').type("{enter}");
					cy.get('[data-cy="textInput"]').should("have.value", suggestionText);
				})
		});
	});
});
