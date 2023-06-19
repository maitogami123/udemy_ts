// autobind decorator
function Autobind(
  _target: any,
  _propertyName: string,
  propertyDescriptor: PropertyDescriptor
) {
  const originalDescriptor = propertyDescriptor.value;
  const modifiedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalDescriptor.bind(this);
      return boundFn;
    },
  };
  return modifiedDescriptor;
}

interface IValidatorStorage {
  [targetName: string]: {
    [validators: string]: string[];
  };
}

const registeredValidators: IValidatorStorage = {};

function AddValidator(validatorNames: string[]) {
  let validators: string[];
  validators = [];
  return function(target: any, propName: string) {
    if (
      target.constructor.name in registeredValidators &&
      propName in registeredValidators[target.constructor.name]
    ) {
      validators = registeredValidators[target.constructor.name][propName];
    }
  
    registeredValidators[target.constructor.name] = {
      ...registeredValidators[target.constructor.name],
      [target.constructor.name]: [...validators, ...validatorNames]
    }
  }
}

const handleValidate = (obj: any):boolean => {
  const objValidationConfig = registeredValidators[obj.constructor.name];
  if(!objValidationConfig) {
    return true;
  }

  let isValid = true;

  for (const propName in objValidationConfig) {
    for (const option of objValidationConfig[propName]) {
      switch(option) {
        case 'required':
          isValid = isValid && !!obj[propName];
          break;
        case 'positive':
          isValid = obj[propName] > 0
          break;
      }
    }
  }

  return isValid;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  @AddValidator(['required'])
  titleInputElement: HTMLInputElement;
  @AddValidator(['required'])
  descriptionInputElement: HTMLInputElement;
  @AddValidator(['positive', 'required'])
  peopleInputElement: HTMLInputElement;

  constructor() {
    // alt <HTMLTemplateElement>document.getElementById('project-input')!
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      enteredTitle.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredPeople.trim().length === 0
    ) {
      alert("Invalid input, please try again!");
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      if (!handleValidate(userInput)) {
        alert("Invalid input, please try again!")
        return;
      }
      console.log(title, desc, people);
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjInput = new ProjectInput();
