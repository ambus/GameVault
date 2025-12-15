describe('GameVault - dodawanie i wyszukiwanie gier', () => {
  it('powinno dodać nową grę i znaleźć ją przez wyszukiwarkę', () => {
    cy.visit('/games');

    cy.contains('Dodaj grę').click();

    cy.get('input[formcontrolname="name"]').type('Nowa gra');

    cy.get('p-dropdown[formcontrolname="genre"]').click();
    cy.contains('RPG').click();

    cy.get('p-dropdown[formcontrolname="platform"]').click();
    cy.contains('PC').click();

    cy.get('button[type="submit"]').click();

    cy.get('input[placeholder="Szukaj gier..."]').type('Nowa gra');
    cy.contains('td', 'Nowa ga').should('exist');
  });
});


