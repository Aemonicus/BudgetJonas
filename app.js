// Budget Controller 
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  var Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  var calculateTotal = function (type) {
    var sum = 0
    data.allItems[type].forEach(function (item) {
      sum += item.value
    })
    data.totals[type] = sum
  }


  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function (type, desc, val) {
      var newItem, ID

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1
      } else {
        ID = 0
      }

      // Create new item based on "inc" or "exp" type
      if (type === "exp") {
        newItem = new Expense(ID, desc, val)
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val)
      }

      // Push it into our data structure
      data.allItems[type].push(newItem)

      // Return the new element
      return newItem
    },

    deleteItem: function (type, id) {
      var ids, index

      var ids = data.allItems[type].map(function (item) {
        return item.id
      })

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses 
      calculateTotal("exp")
      calculateTotal("inc")

      // calculate the budget: income - expenses 
      data.budget = data.totals.inc - data.totals.exp

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
      } else {
        data.percentage = -1
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (item) {
        item.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (item) {
        return item.getPercentage()
      })
      return allPerc
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    }
  }

})();



// UI Controller
var UIController = (function () {

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  }

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type
    // + or - before number 
    // exactly 2 decimal points
    // comma separating the thousands

    num = Math.abs(num)
    num = num.toFixed(2)

    numSplit = num.split(".")
    int = numSplit[0]
    dec = numSplit[1]

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3) // input 2310, output = 2,310
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec
  }

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp for expenses
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },

    addListItem: function (obj, type) {
      var html, newHtml, element

      if (type === "inc") {
        element = DOMStrings.incomeContainer
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      newHtml = html.replace("%id%", obj.id)
      newHtml = newHtml.replace("%description%", obj.description)
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type))

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml)
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID)
      el.parentNode.removeChild(el)
    },

    clearFields: function () {
      var fields, fieldsArr
      fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue)

      fieldsArr = Array.prototype.slice.call(fields)

      fieldsArr.forEach(function (item, index, array) {
        item.value = ""
      })

      fieldsArr[0].focus()
    },

    displayBudget: function (obj) {
      var type
      obj.budget > 0 ? type = "inc" : "exp"

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type)
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc")
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp")

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%"
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage = "--"
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel)

      nodeListForEach(fields, function (item, index) {
        if (percentages[index] > 0) {
          item.textContent = percentages[index] + "%"
        } else {
          item.textContent = "--"
        }
      })
    },

    displayMonth: function () {
      var now, year, month, months
      now = new Date()

      months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"]
      month = now.getMonth()

      year = now.getFullYear()
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year
    },

    changeType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + "," +
        DOMStrings.inputDescription + "," +
        DOMStrings.inputValue
      )

      nodeListForEach(fields, function (item) {
        item.classList.toggle("red-focus")
      })

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red")
    },

    getDOMStrings: function () {
      return DOMStrings
    }
  }
})()



// Global APP Controller 
var controller = (function (budgetCtrl, UICtrl) {

  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings()

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem)

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }
    })

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem)

    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType)
  }

  var updateBudget = function () {
    // Calculate the budget 
    budgetCtrl.calculateBudget()

    // Return the budget 
    var budget = budgetCtrl.getBudget()

    // Display the budget on the UI 
    UICtrl.displayBudget(budget)
  }

  var updatePercentages = function () {

    // Calculate percentages 
    budgetCtrl.calculatePercentages()

    // Read percentages from the budget controller 
    var percentages = budgetCtrl.getPercentages()

    // Update the UI with the new percentages 
    UICtrl.displayPercentages(percentages)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // Get the field input data 
    input = UICtrl.getInput()

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to the budget controller 
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      // Add the item to the UI 
      UICtrl.addListItem(newItem, input.type)

      // Clear the fields 
      UICtrl.clearFields()

      // Calculate and update budget 
      updateBudget()

      // Calculate and update percentages 
      updatePercentages()
    }

  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
      splitID = itemID.split("-")
      type = splitID[0]
      ID = parseInt(splitID[1])

      // Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // Delete the item from the UI
      UICtrl.deleteListItem(itemID)

      // Update and show the new budget
      updateBudget()

      // Calculate and update percentages 
      updatePercentages()
    }
  }

  return {
    init: function () {
      console.log("started")
      UICtrl.displayMonth()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      })
      setupEventListeners()
    }
  }

})(budgetController, UIController)

controller.init()