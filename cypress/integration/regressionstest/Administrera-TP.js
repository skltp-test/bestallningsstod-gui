//Hardcoded ENV
let env = {
	root : 'http://localhost:25000',
	backend: 'http://localhost:25000/services/backend',
}



/* Stödfunktioner 
	TODO: Flytta testdata till fixtures
*/
function replaceChars(s) {
	s = s.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	})
	return s
}
const generate = {
	"UUID" : function() {
		return replaceChars('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')
	},
	"TestString" : function() {
		return replaceChars('xxxxxxxx')
	},
	"UTF8-TestString" : function() {
		return 'xxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	//TODO här kan man göra en funktion för längre test-strängar
}


describe('TF 1.1.1 - Användare kan beställa ny producent anslutning', function() {
	// Variablar
	let testrun = {
		orderHistory : {
			orderIndex : 0
		}
	}
	let testdata = {
		miljo: 'NTJP TEST',
		tjansteproducent: 'TSTNMT2321000156-B02',
		tjanstekontrakt: 'CancelBooking',
		logiskAdressat : {
			ny: {
				hsaId : 'TEST123',
				namn: 'Test 123'
			},
			existerande: 'TEST123'
		},
		url : 'http://testurl.nordicmedtest.se',
		ovrigInformation : 'En Teststräng åäöÅÄÖ' + generate['UTF8-TestString'](),
		kontaktinformation : ''
	}
	
	
    context('Användare i beställningstödet - Mina beställningar', function() {
		it('Går till "Mina beställningar"', function() {
			cy.visit(env.root + '/#/orderhistory')
			cy.get('[translate="order_history.title"]').should('be.visible')
		})
		it('Kan kontrollera löpnumret i beställningshistoriken', function() {
			//Vänta att tabellrader har populerats
			cy.get('[ng-repeat="order in orderHistory | orderBy:[' + "'-created', '-id'" + ']"]').should('be.visible')
			cy.get('tbody > :nth-child(1) > :nth-child(1)').then(($cell) => {
			let orderIndex = parseInt($cell.text().trim(), 10)
		    assert.isNotNull(orderIndex)
			assert.isNumber(orderIndex)
			assert.isAbove(orderIndex, 0)

			// Spara löpnumret till senare			
			testrun.orderHistory.orderIndex = orderIndex
			})
		})
	})
	context('Användare i beställningstödet - Administrera tjänsteproducent', function() {
		it('Går till "administrera tjänsteproducent".', function() {
			cy.visit(env.root + '/#/order/producent')
			//Vänta att sidan laddas
			cy.get('[translate="order.producent.header.title"]').should('be.visible')
		})
		it('Kan välja miljön "' + testdata.miljo +'"', function() {
			//assert.isNumber(miljo)
			cy.get('#environment').select(testdata.miljo)
			
		})
		it('Kan ange tjänsteproducent "' + testdata.tjansteproducent + '"', function() {
			// Sök efter thänsteproducent
			cy.get('.col-md-12 > .form-group > .form-control').should('be.visible')
			cy.get('.col-md-12 > .form-group > .form-control').type(testdata.tjansteproducent)
			cy.get('.col-md-12 > .form-group > .form-control').type('{enter}')
			//Vänta på sökresultat
			cy.get('[ng-bind-html="match.model.organisation | uibTypeaheadHighlight:query | trusted"]').should('be.visible')
			//Spåra back-end requests
			cy.server().route("GET",'/bs-api/api/anslutningar/**').as('getAnslutningar')
			//Klicka på hittat alternativ
			cy.get('a').contains(testdata.tjansteproducent).click()
			//Vänta på back-end requests
			cy.wait('@getAnslutningar')
		})
		it('Kan ange tjänstekontrakt som omfattas "' + testdata.tjanstekontrakt + '"', function() {
			cy.get('domain-contract-search > .form-group > .form-control').should('be.visible')
			cy.get('domain-contract-search > .form-group > .form-control').type(testdata.tjanstekontrakt)
			//Vänta på sökresultatet
			cy.get('[ng-if="match.model.tjanstekontraktNamn"]').should('be.visible')
			//Välj tjänstekontrakt
			cy.get('strong').contains(testdata.tjanstekontrakt).click()
		})	
		it('Kan ange ny logisk adressat "' + testdata.logiskAdressat.ny.hsaId + '"', function() {
			cy.get('#optionsRadios1').click()
			
			cy.get('#newLogicalAddress_HSAID').type(testdata.logiskAdressat.ny.hsaId)
			cy.get('#newLogicalAddress_Name').type('Namn: ' + testdata.logiskAdressat.ny.namn)
			cy.get('[ng-click="addNewLogicalAddress(newLogicalAddress); newLogicalAddress = {};"]').click()
			
			cy.get('[ng-repeat="logiskAdress in getNewLogicalAddresses() | orderBy:' + "'namn'" + ' track by logiskAdress.hsaId"] > :nth-child(3)').should(($row) => {
				expect($row).to.contain(testdata.logiskAdressat.ny.hsaId)
			})
		})		
		//it('Kan ange befintlig logisk adressat ' + testdata.logiskAdressat.existerande + '', function() {
		//})		
		it('Kan ange URL "' + testdata.url + '" för "' + testdata.tjanstekontrakt + '"', function() {
			cy.get('.ui-select-match > .btn-default').type(testdata.url)
			cy.get('.ui-select-highlight').click()
		})	
		it('Kan ange övrig information', function() {
			cy.get('#ovrigInformation').type(testdata.ovrigInformation)
		})	
		//it('Kan ange beställarens kontaktinformation', function() {
		//})	
		it('Kan spara beställningen', function() {
			cy.get(':nth-child(5) > .col-md-12 > [ng-click="save()"]').click()
			//Vänta på att mina beställningar sidan laddas
			cy.get('[translate="order_history.title"]').should('be.visible')
		})			
		
	})
	context('Användare i beställningstödet - Mina beställningar', function() {
		it('Går till "Mina beställningar"', function() {
			cy.visit(env.root + '/#/orderhistory')
			cy.get('[translate="order_history.title"]').should('be.visible')
		})
		it('Så ska löpnumret i beställningshistoriken ökat', function() {
			let orderIndex = this.orderIndex;
			console.log(this.orderIndex)
			cy.get('tbody > :nth-child(1) > :nth-child(1)').then(($cell) => {
			  let orderIndex = parseInt($cell.text().trim(), 10)
			    assert.isNotNull(orderIndex)
				assert.isNumber(orderIndex)
				assert.isAbove(orderIndex, testrun.orderHistory.orderIndex)
			
			  // Spara löpnumret till senare
			  testrun.orderHistory.orderIndex = orderIndex
			})
		})
	})
	context('Användare skickar in beställning', function() {
		it('Kan gå in på beställningen', function() {
			cy.visit(env.root + '#/order/producent?orderId=' + testrun.orderHistory.orderIndex)
		})
		it('Kan kontrollera logiskAdress', function() {
			
			cy.get('[ng-repeat="logiskAdress in getNewLogicalAddresses() | orderBy:' + "'namn'" + ' track by logiskAdress.hsaId"] > :nth-child(3)').should(($row) => {
				expect($row).to.contain(testdata.logiskAdressat.ny.hsaId)
			})
		})
		it('Kan skicka beställningen', function() {
			cy.get('[ng-click="triggerSendOrder()"]').should('be.visible')
			cy.get('[ng-click="triggerSendOrder()"]').click()
			cy.get('[translate="order.main.review.send_btn"]').should('be.visible')
			cy.get('button').contains('Skicka beställning').click()
		})
	})
	context('Användare läser bekräftelsemeddelande', function() {
		it('Kan läsa att beställningen är mottagen', function() {
			cy.get('[translate="order.confirmation.text"').should('be.visible')
			cy.get('p').contains('Beställningen kommer nu skickas till tjänsteplattformens servicedesk').should('be.visible')
		})
	})
	context('Användare i beställningstödet - Mina beställningar', function() {
		it('Går till "Mina beställningar"', function() {
			cy.visit(env.root + '/#/orderhistory')
			cy.get('[translate="order_history.title"]').should('be.visible')
		})
		it('Så ska beställningens status vara skickat', function() {
			cy.get('tbody > :nth-child(1) > :nth-child(1)').should(($cell) => {
				expect($cell).to.contain(testrun.orderHistory.orderIndex)
			})
			cy.get('tbody > :nth-child(1) > :nth-child(5)').should(($cell) => {
				expect($cell).to.contain('Skickad')
			})
		})
		it('Kan gå in på beställningen', function() {
			cy.visit(env.root + '#/order/producent?orderId=' + testrun.orderHistory.orderIndex)
		})
		it('Kan kontrollera beställningen efter att den blivit skickad.', function() {
			cy.get('[ng-if="nyaProducentanslutningar.length"]').should(($body) => {
				expect($body).to.contain(testdata.tjanstekontrakt)
				expect($body).to.contain(testdata.logiskAdressat.ny.hsaId)
				expect($body).to.contain(testdata.logiskAdressat.ny.namn)
				expect($body).to.contain(testdata.url)
			})
			cy.get('[ng-if="bestallning.otherInfo"]').should(($elm) => {
				expect($elm).to.contain(testdata.ovrigInformation)
			})
		})
	})
})
