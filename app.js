// Budget Controller 
var budgetController = (function () {

})();


// UI Controller
var UIController = (function () {

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn"
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp for expenses
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value
      }
    },

    getDOMStrings: function () {
      return DOMStrings
    }
  }
})()


// Global APP Controller 
var controller = (function (budgetCtrl, UICtrl) {

  var DOM = UICtrl.getDOMStrings()

  var ctrlAddItem = function () {
    var input = UICtrl.getInput()
    console.log(input)
  }

  document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem)

  document.addEventListener("keypress", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
      ctrlAddItem()
    }
  })

})(budgetController, UIController)