describe('Antibiotic Data Entry Application', () => {
    it('should load the application and display the form', () => {
        cy.visit('http://localhost:3000');
        cy.get('h1').should('contain', 'Antibiotic Data Entry');
        cy.get('#data-form').should('be.visible');
    });

    it('should submit the form and display the data in the table', () => {
        cy.visit('http://localhost:3000');
        cy.get('#issue_date').type('2025-01-06');
        cy.get('#antibiotic_name').type('Amoxicillin');
        cy.get('#ward_name').type('WD1');
        cy.get('#quantity').type('10');
        cy.get('#submit-button').click();

        cy.get('#table-body').should('contain', 'Amoxicillin');
    });

    // Add more end-to-end tests for other functionalities
});
