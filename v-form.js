(() => {
  const registerIdInScope = function (id, scope, element) {
    console.log("[trace][v-form] registerIdInScope");
    if (typeof id === "undefined" && typeof scope === "undefined") {
      return false;
    } else if (typeof scope === "undefined") {
      return false;
    } else if (scope === null) {
      return false;
    } else if (id === null) {
      return false;
    }
    if (id in scope) {
      // !@EXPERIMENTAL: volver a quitar el comentario si es muy loco.
      // throw new Error(`Cannot repeat id «${id}» in scope on «registerIdInScope»`);
    }
    scope[id] = element;
    return true;
  };
  const capitalize = function (txt) {
    return txt.substr(0, 1).toUpperCase() + txt.substr(1);
  };
  const getRandomString = function (len = 10) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    let out = "";
    while (out.length < len) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  };
  const generateGetChildrenFunction = function (el, binding, objectType = "form") {
    console.log("[trace][v-form] generateGetChildrenFunction");
    const isForm = objectType === "form";
    const isControl = (!isForm) && (objectType === "control");
    const canHaveChildren = isForm || isControl;
    if (canHaveChildren) {
      return function () {
        console.log(`[trace][v-form] getChildren (from ${objectType})`);
        // !@TODO: encontrar nodos hijo en el scope pertinente
        const id = el.$lswFormMetadata.parameters.selfId;
        const scope = el.$lswFormMetadata.parameters.selfScope;
        const scopeIds = Object.keys(scope);
        const children = [];
        for (let index = 0; index < scopeIds.length; index++) {
          const elementId = scopeIds[index];
          const element = scope[elementId];
          const elementParentId = element.$lswFormMetadata.parameters.parentId;
          if (elementParentId === id) {
            children.push(element);
          }
        }
        const expectation1 = parseInt(el.$lswFormMetadata.parameters.expectedChildren) || -1;
        if (expectation1 !== -1) {
          if (expectation1 !== children.length) {
            throw new Error(`Failed «expectedChildren» on «{${Object.keys(el.$lswFormMetadata.parameters.selfScope).join(", ")}}.${el.$lswFormMetadata.parameters.selfId}»: current=${children.length} / expected=${expectation1}`);
          }
        }
        const elementTag = el.tagName;
        const elementClasses = el.className.split(" ").join(".");
        const vFormType = el.$lswFormMetadata.type;
        console.log(`[trace][v-form] Found ${children.length} children on «${elementTag.toLowerCase()}${elementClasses ? '.' + elementClasses : ''} v-form.${vFormType}»`);
        return children;
      };
    } else {
      throw new Error(`Required parameter «objectType» to be a valid option (form, control, input, error) on «v-form.${el.$lswFormMetadata.type}» directive`);
    }
  };
  const generateGetValueFunction = function (el, binding, objectType = "form") {
    console.log("[trace][v-form] generateGetValueFunction");
    const applyFormat = (...args) => {
      if (el.$lswFormMetadata.parameters.onFormat) {
        return el.$lswFormMetadata.parameters.onFormat(...args);
      }
      return args[0];
    };
    if (el.$lswFormMetadata.parameters.onGetValue) {
      return function () {
        const result = el.$lswFormMetadata.parameters.onGetValue(el, binding);
        return applyFormat(result);
      };
    }
    if (objectType === "form") {
      return function () {
        console.log("[trace][v-form] getValue (from form)");
        const allChildren = this.getChildren();
        const finalValue = {};
        Iterating_children_of_form_to_get_values:
        for (let index = 0; index < allChildren.length; index++) {
          const child = allChildren[index];
          if(child.$lswFormMetadata.type === "error") {
            continue Iterating_children_of_form_to_get_values;
          }
          const value = child.$lswFormMetadata.methods.getValue();
          const prop = child.$lswFormMetadata.parameters.name;
          if(typeof prop !== "string") {
            // !@EASYERROR!
            // All v-form.FORM nodes must have a «name». 
            // This error is extensively documented and debugged
            // because it is easy to be committed.
            const directiveType = child.$lswFormMetadata.type;
            const directiveElement = child.tagName;
            console.error(`[!] Error fetching «name» property on «v-form.form» child. All «v-form.*» nodes that are children of «v-form.form» must have a «name» property on «vForm.getValue». Details provided below:`);
            console.log("Directive tag:", el.tagName);
            console.log("Directive element:", el);
            console.log("Directive type:", el.$lswFormMetadata.type);
            console.log("Directive expression:", el.$lswFormMetadata.expression);
            console.log("Child tag:", child.tagName);
            console.log("Child element:", child);
            console.log("Child type:", child.$lswFormMetadata.type);
            console.log("Child expression:", child.$lswFormMetadata.expression);
            throw new Error(`Required child «v-form.${directiveType}» on element «${directiveElement}» to have property «name» as string on «getValue»`);
          }
          finalValue[prop] = value;
        }
        return applyFormat(finalValue);
      };
    } else if (objectType === "control") {
      return function () {
        console.log("[trace][v-form] getValue (from control)");
        const allChildren = this.getChildren();
        let finalValue = {};
        Iterating_children_of_control_to_get_values:
        for (let index = 0; index < allChildren.length; index++) {
          const child = allChildren[index];
          const value = child.$lswFormMetadata.methods.getValue();
          const prop = child.$lswFormMetadata.parameters.name;
          if(prop === null) {
            // !@CAUTION!
            // Passing explicitly a null on «name» means to override the whole CONTROL value:
            finalValue = value;
          } else if(typeof prop !== "string") {
            // !@EASYERROR!
            // All v-form.CONTROL nodes must have a «name» or be null.
            // This error is extensively documented and debugged
            // because it is easy to be committed.
            const directiveType = child.$lswFormMetadata.type;
            const directiveElement = child.tagName;
            console.error(`[!] Error fetching «name» property on «v-form.form» child. All «v-form.*» nodes that are children of «v-form.form» must have a «name» property on «vForm.getValue». Details provided below:`);
            console.log("Directive tag:", el.tagName);
            console.log("Directive element:", el);
            console.log("Directive type:", el.$lswFormMetadata.type);
            console.log("Directive expression:", el.$lswFormMetadata.expression);
            console.log("Child tag:", child.tagName);
            console.log("Child element:", child);
            console.log("Child type:", child.$lswFormMetadata.type);
            console.log("Child expression:", child.$lswFormMetadata.expression);
            throw new Error(`Required child «v-form.${directiveType}» on element «${directiveElement}» to have property «name» as string on «getValue»`);
          } else {
            // !@NORMALLY:
            finalValue[prop] = value;
          }
        }
        return applyFormat(finalValue);
      };
    } else if (objectType === "input") {
      return function () {
        console.log("[trace][v-form] getValue (from input)");
        const tagName = el.tagName.toLowerCase();
        const valuedTags = ["input", "textarea", "select"];
        if (valuedTags.indexOf(tagName) !== -1) {
          return el.value;
        }
        return applyFormat(el.textContent);
      };
    } else {
      throw new Error(`Required parameter «objectType» to be a valid option (form, control, input, error) on v-form directive`);
    }
  };
  const generateSubmitFunction = function (el, binding) {
    return async function () {
      console.log("[trace][v-form] generateFormObject.submit");
      try {
        const validationResult = await this.validate();
        const value = await this.getValue();
        console.log("Final form value:", value);
        if (el.$lswFormMetadata.parameters.onSubmit) {
          return el.$lswFormMetadata.parameters.onSubmit(value, el, this);
        }
        return value;
      } catch (error) {
        this.propagateError(error);
      }
    };
  };
  const generateCommonValidateFunction = function (el, binding, objectType = "form") {
    return async function () {
      console.log(`[trace][v-form] generate${capitalize(objectType)}Object.commonValidate`);
      const children = this.getChildren();
      const arisedErrors = [];
      Iterating_subscribed_children:
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        try {
          if (child.$lswFormMetadata.type === "error") {
            break Iterating_subscribed_children;
          }
          await child.$lswFormMetadata.methods.validate();
        } catch (error) {
          arisedErrors.push(error);
        }
      }
      try {
        if (el.$lswFormMetadata.parameters.onValidate) {
          await el.$lswFormMetadata.parameters.onValidate();
        }
      } catch (error) {
        arisedErrors.push(error);
      }
      if (arisedErrors.length) {
        const unifiedErrorMessage = arisedErrors.map(e => `  - ${e.name}: ${e.message}`).join("\n");
        this.propagateError(unifiedErrorMessage);
        throw unifiedErrorMessage;
      }
      this.propagateSuccess();
      return true;
    };
  }
  const generateValidateFunction = function (el, binding, objectType = "form") {
    if (objectType === "form") {
      return generateCommonValidateFunction(el, binding, "form");
    } else if (objectType === "control") {
      return generateCommonValidateFunction(el, binding, "control");
    } else if (objectType === "input") {
      return async function () {
        console.log("[trace][v-form] generateInputObject.validate");
        if (el.$lswFormMetadata.parameters.onValidate) {
          try {
            const value = await this.getValue();
            await el.$lswFormMetadata.parameters.onValidate(value, el, this);
            this.propagateSuccess();
          } catch (error) {
            this.propagateError(error);
            throw error;
          }
        }
      };
    } else {
      throw new Error(`Required parameter «objectType» to be a valid option (form, control, input, error) on v-form directive`);
    }
  };
  const generatePropagateErrorFunction = function (el, binding, objectType = "form") {
    return function (error) {
      console.log("[trace][v-form] propagateError");
      console.log(error);
      Propagate_arriba: {
        const parentId = el.$lswFormMetadata.parameters.parentId;
        const parentScope = el.$lswFormMetadata.parameters.parentScope;
        const notPretendsParent = (!parentScope) || (!parentId);
        if (notPretendsParent) {
          break Propagate_arriba;
        }
        const notFoundParent = !(parentId in parentScope);
        if (notFoundParent) {
          console.log(`[error][v-form] Directive «${el.$lswFormMetadata.tagName} v-form.${el.$lswFormMetadata.type}» could not find «parentId:${parentId}» in parentScope with keys: «${Object.keys(parentScope).join(", ")}»`);
          console.log(`[error][v-form] This error will be ignored in order to continue fluently the tree-up error propagation as expected.`);
        }
        const parentElement = parentScope[parentId];
        const isFormType = parentElement.$lswFormMetadata.type === "form";
        const isControlType = parentElement.$lswFormMetadata.type === "control";
        const isInputType = parentElement.$lswFormMetadata.type === "input";
        const shouldPropagateUp = (isFormType || isControlType) && !isInputType;
        if (shouldPropagateUp) {
          parentElement.$lswFormMetadata.methods.propagateError(error);
        }
      }
      Propagate_abajo: {
        const selfId = el.$lswFormMetadata.parameters.selfId;
        const selfScope = el.$lswFormMetadata.parameters.selfScope;
        const selfScopeKeys = Object.keys(selfScope);
        for (let index = 0; index < selfScopeKeys.length; index++) {
          const selfScopeKey = selfScopeKeys[index];
          const selfScopeElement = selfScope[selfScopeKey];
          const elementParentId = selfScopeElement.$lswFormMetadata.parameters.parentId;
          const isChild = elementParentId === selfId;
          const isErrorType = selfScopeElement.$lswFormMetadata.type === "error";
          const shouldPropagateDown = isChild && isErrorType;
          if (shouldPropagateDown) {
            selfScopeElement.$lswFormMetadata.methods.propagateError(error);
          }
        }
      }
      if (el.$lswFormMetadata.parameters.onError) {
        try {
          el.$lswFormMetadata.parameters.onError(error);
        } catch (error) {
          console.log(error); // only prints, onError should be safe function.
        }
      }
    };
  };
  const generatePropagateSuccessFunction = function (el, binding, objectType = "form") {
    return function () {
      console.log("[trace][v-form] propagateSuccess");
      Propagate_abajo: {
        const selfId = el.$lswFormMetadata.parameters.selfId;
        const selfScope = el.$lswFormMetadata.parameters.selfScope;
        const selfScopeKeys = Object.keys(selfScope);
        for (let index = 0; index < selfScopeKeys.length; index++) {
          const selfScopeKey = selfScopeKeys[index];
          const selfScopeElement = selfScope[selfScopeKey];
          const elementParentId = selfScopeElement.$lswFormMetadata.parameters.parentId;
          const isChild = elementParentId === selfId;
          const isErrorType = selfScopeElement.$lswFormMetadata.type === "error";
          if (isChild && isErrorType) {
            selfScopeElement.$lswFormMetadata.methods.propagateSuccess();
          }
        }
        if (el.$lswFormMetadata.parameters.onValidated) {
          el.$lswFormMetadata.parameters.onValidated(el, binding);
        }
      }
    };
  };
  const generateFormObject = function (el, binding) {
    console.log("[trace][v-form] generateFormObject");
    return {
      getChildren: generateGetChildrenFunction(el, binding, "form"),
      getValue: generateGetValueFunction(el, binding, "form"),
      submit: generateSubmitFunction(el, binding, "form"),
      validate: generateValidateFunction(el, binding, "form"),
      propagateSuccess: generatePropagateSuccessFunction(el, binding, "form"),
      propagateError: generatePropagateErrorFunction(el, binding, "form"),
    };
  };
  const generateControlObject = function (el, binding) {
    console.log("[trace][v-form] generateControlObject");
    return {
      getChildren: generateGetChildrenFunction(el, binding, "control"),
      getValue: generateGetValueFunction(el, binding, "control"),
      validate: generateValidateFunction(el, binding, "control"),
      propagateSuccess: generatePropagateSuccessFunction(el, binding, "control"),
      propagateError: generatePropagateErrorFunction(el, binding, "control"),
    };
  };
  const generateInputObject = function (el, binding) {
    console.log("[trace][v-form] generateErrorObject");
    return {
      getChildren: false,
      getValue: generateGetValueFunction(el, binding, "input"),
      validate: generateValidateFunction(el, binding, "input"),
      propagateSuccess: generatePropagateSuccessFunction(el, binding, "input"),
      propagateError: generatePropagateErrorFunction(el, binding, "input")
    };
  };
  const generateErrorObject = function (el, binding) {
    console.log("[trace][v-form] generateErrorObject");
    return {
      setError: function (error) {
        console.log("[trace][v-form] generateErrorObject.setError");
        el.textContent = `${error.name}: ${error.message}`;
      },
      clearError: function () {
        console.log("[trace][v-form] generateErrorObject.clearError");
        el.textContent = "";
      },
      propagateError: function (...args) {
        console.log("[trace][v-form] generateErrorObject.propagateError");
        const error = args[0];
        el.classList.remove("successBox");
        el.classList.add("errorBox");
        this.setError(...args);
        if (el.$lswFormMetadata.parameters.onError) {
          try {
            el.$lswFormMetadata.parameters.onError(error, el, this);
          } catch (error) {
            console.log(error); // only prints, onError should be safe function.
          }
        }
      },
      propagateSuccess: function (...args) {
        console.log("[trace][v-form] generateErrorObject.propagateSuccess");
        el.classList.remove("errorBox");
        el.classList.add("successBox");
        if (el.$lswFormMetadata.parameters.onValidated) {
          el.$lswFormMetadata.parameters.onValidated(el, this);
        }
        if (el.$lswFormMetadata.parameters.onSuccessStatus) {
          return this.setError(el.$lswFormMetadata.parameters.onSuccessStatus);
        } else {
          return this.clearError();
        }
      }
    };
  };
  const loadMetadataAsForm = function (el, binding) {
    console.log("[trace][v-form] loadMetadataAsForm");
    try {
      el.$lswFormMetadata = {
        type: "form",
        component: binding.instance,
        expression: binding.expression,
        parameters: binding.value,
        element: el,
      };
      const params = binding.value;
      Validate_parameters: {
        const { parentId } = params;
        const { parentScope } = params;
        const { selfId } = params;
        const { selfScope } = params;
        const { onValidate } = params;
        const { onValidated } = params;
        const { onSubmit } = params;
        if (typeof parentId === "undefined") {
          // !@OK. Because form can have no parent.
        } else if (typeof parentId !== "string") {
          throw new Error(`Required parameter «parentId» to be a string on «v-form.form» directive on «loadMetadataAsForm»`);
        }
        if (typeof parentScope === "undefined") {
          // !@OK. Because form can have no parent.
        } else if (typeof parentScope !== "object") {
          throw new Error(`Required parameter «parentScope» to be an object on «v-form.form» directive on «loadMetadataAsForm»`);
        }
        if (typeof selfId !== "string") {
          throw new Error(`Required parameter «selfId» to be a string on «v-form.form» directive on «loadMetadataAsForm»`);
        }
        if (typeof selfScope !== "object") {
          throw new Error(`Required parameter «selfScope» to be an object on «v-form.form» directive on «loadMetadataAsForm»`);
        }
        if (typeof onValidate === "undefined") {
          // !@OK.
        } else if (typeof onValidate !== "function") {
          throw new Error(`Required parameter «onValidate» to be a function on «v-form.form» directive on «loadMetadataAsForm»`);
        }
        if (typeof onSubmit === "undefined") {
          // !@OK.
        } else if (typeof onSubmit !== "function") {
          throw new Error(`Required parameter «onSubmit» to be an function on «v-form.form» directive on «loadMetadataAsForm»`);
        }
      }
      Inject_scopes: {
        const finalSelfId = params.selfId || null;
        const selfScopedOk = registerIdInScope(finalSelfId, params.selfScope, el);
        const parentScopedOk = registerIdInScope(finalSelfId, params.parentScope, el);
        if (!selfScopedOk) {
          // !@ERROR. Because forms requires children.
          throw new Error(`Required «v-form.form» directive to be able to register «selfId» in «selfScope» on «loadMetadataAsForm»`);
        }
        if (!parentScopedOk) {
          // !@OK. Because form does not need a parent.
        }
      }
      Inject_api: {
        el.$lswFormMetadata.methods = generateFormObject(el, binding);
      }
    } catch (error) {
      console.log("[!] Error fetching «name» property on  Error loading v-form.form:", binding);
      throw error;
    }
  };
  const loadMetadataAsControl = function (el, binding) {
    console.log("[trace][v-form] loadMetadataAsControl");
    try {
      el.$lswFormMetadata = {
        type: "control",
        component: binding.instance,
        expression: binding.expression,
        parameters: binding.value,
        element: el,
      };
      const params = binding.value;
      Validate_parameters: {
        const { parentId } = params;
        const { parentScope } = params;
        const { selfId } = params;
        const { selfScope } = params;
        const { name } = params;
        const { onValidate } = params;
        const { onValidated } = params;
        const { onSubmit } = params;
        if (typeof parentScope !== "object") {
          throw new Error(`Required «v-form.control» to have always an object as «parentScope» parameter on «loadMetadataAsControl»`);
        }
        if (typeof parentId !== "string") {
          throw new Error(`Required «v-form.control» to have always a string as «parentId» on «loadMetadataAsControl»`);
        }
        if (typeof selfScope !== "object") {
          throw new Error(`Required «v-form.control» to have always an object as «selfScope» parameter on «loadMetadataAsControl»`);
        }
        if (typeof selfId !== "string") {
          throw new Error(`Required «v-form.control» to have always a string as «selfId» parameter on «loadMetadataAsControl»`);
        }
        if (typeof name !== "string") {
          if(name !== null) {
            throw new Error(`Required «v-form.control» to have always a string [or at least «null» to override the value not only a property] as «name» parameter on «loadMetadataAsControl»`);
          }
        }
        if ((typeof onValidate !== "undefined") && (typeof onValidate !== "function")) {
          throw new Error(`Required «v-form.control» to have always a function or undefined as «onValidate» parameter on «loadMetadataAsControl»`);
        }
        if ((typeof onSubmit !== "undefined") && (typeof onSubmit !== "function")) {
          throw new Error(`Required «v-form.control» to have always a function or undefined as «onSubmit» parameter on «loadMetadataAsControl»`);
        }
        if ((typeof onValidated !== "undefined") && (typeof onValidated !== "function")) {
          throw new Error(`Required «v-form.control» to have always a function or undefined as «onValidated» parameter on «loadMetadataAsControl»`);
        }
      }
      Inject_scopes: {
        const finalSelfId = params.selfId || "control." + getRandomString(10);
        const selfScopedOk = registerIdInScope(finalSelfId, params.selfScope, el);
        const parentScopedOk = registerIdInScope(finalSelfId, params.parentScope, el);
        if (!selfScopedOk) {
          // !@OK. Because control does not need a children.
        }
        if (!parentScopedOk) {
          throw new Error(`Required «v-form.control» directive to be able to register «selfId» in «parentScope» on «loadMetadataAsForm»`);
        }
        if ((!selfScopedOk) && (!parentScopedOk)) {
          throw new Error(`Required «v-form.control» directive to register «parentId» or «selfId» but not none on «loadMetadataAsControl»`);
        }
      }
      Inject_api: {
        el.$lswFormMetadata.methods = generateControlObject(el, binding);
      }
    } catch (error) {
      console.log("[!] Error fetching «name» property on  Error loading v-form.control:", binding);
      throw error;
    }
  };
  const loadMetadataAsInput = function (el, binding) {
    console.log("[trace][v-form] loadMetadataAsInput");
    try {
      el.$lswFormMetadata = {
        type: "input",
        component: binding.instance,
        expression: binding.expression,
        parameters: binding.value,
        element: el,
      };
      const params = binding.value;
      Validate_parameters: {
        const { parentId } = params;
        const { parentScope } = params;
        const { selfId } = params;
        const { selfScope } = params;
        const { name } = params;
        const { onValidate } = params;
        const { onValidated } = params;
        const { onSubmit } = params;
        if (typeof parentScope !== "object") {
          throw new Error(`Required «v-form.input» to have always an object as «parentScope» parameter on «loadMetadataAsInput»`);
        }
        if (typeof parentId !== "string") {
          throw new Error(`Required «v-form.input» to have always a string as «parentId» on «loadMetadataAsInput»`);
        }
        if (typeof selfScope !== "object") {
          // !@OK: input does not need children
        }
        if (typeof selfId !== "string") {
          // !@OK: input does not need children
        }
        if (typeof name !== "string") {
          throw new Error(`Required «v-form.input» to have always a string as «name» parameter on «loadMetadataAsInput»`);
        }
        if ((typeof onValidate !== "undefined") && (typeof onValidate !== "function")) {
          throw new Error(`Required «v-form.input» to have always a function or undefined as «onValidate» parameter on «loadMetadataAsInput»`);
        }
        if ((typeof onSubmit !== "undefined") && (typeof onSubmit !== "function")) {
          throw new Error(`Required «v-form.input» to have always a function or undefined as «onSubmit» parameter on «loadMetadataAsInput»`);
        }
        if ((typeof onValidated !== "undefined") && (typeof onValidated !== "function")) {
          throw new Error(`Required «v-form.input» to have always a function or undefined as «onValidated» parameter on «loadMetadataAsInput»`);
        }
      }
      Inject_scopes: {
        const finalSelfId = params.selfId || "input." + getRandomString(10);
        const selfScopedOk = registerIdInScope(finalSelfId, params.selfScope, el);
        const parentScopedOk = registerIdInScope(finalSelfId, params.parentScope, el);
        if (!selfScopedOk) {
          // !@OK. Because input cannot have a children.
        }
        if (!parentScopedOk) {
          // !@ERROR. Because input requires parent.
          throw new Error(`Required «v-form.input» directive to be able to register «selfId» in «parentScope»`);
        }
      }
      Inject_api: {
        el.$lswFormMetadata.methods = generateInputObject(el, binding);
      }
    } catch (error) {
      console.log("[!] Error fetching «name» property on  Error loading v-form.input:", binding);
      throw error;
    }
  };
  const loadMetadataAsError = function (el, binding) {
    console.log("[trace][v-form] loadMetadataAsError");
    try {
      el.$lswFormMetadata = {
        type: "error",
        component: binding.instance,
        expression: binding.expression,
        parameters: binding.value,
        element: el,
      };
      const params = binding.value;
      Validate_parameters: {
        const { parentId } = params;
        const { parentScope } = params;
        const { selfId } = params;
        const { selfScope } = params;
        const { onValidate } = params;
        const { onValidated } = params;
        const { onSuccessStatus } = params;
        const { onSubmit } = params;
      }
      Inject_scopes: {
        const finalSelfId = params.selfId || "error." + getRandomString(10);
        const selfScopedOk = registerIdInScope(finalSelfId, params.selfScope, el);
        const parentScopedOk = registerIdInScope(finalSelfId, params.parentScope, el);
        if (!selfScopedOk) {
          // !@OK. Because error does not need a children.
        }
        if (!parentScopedOk) {
          // !@ERROR. Because error requires parent.
          throw new Error(`Required «v-form.error» directive to be able to register «selfId» in «parentScope»`);
        }
      }
      Inject_api: {
        el.$lswFormMetadata.methods = generateErrorObject(el, binding);
      }
    } catch (error) {
      console.log("[!] Error fetching «name» property on  Error loading v-form.error:", binding);
      throw error;
    }
  };
  const loadForm = function (el, binding) {
    console.log("[trace][v-form] loadForm");
    loadMetadataAsForm(el, binding);
  };
  const loadControl = function (el, binding) {
    console.log("[trace][v-form] loadControl");
    loadMetadataAsControl(el, binding);
  };
  const loadInput = function (el, binding) {
    console.log("[trace][v-form] loadInput");
    loadMetadataAsInput(el, binding);
  };
  const loadError = function (el, binding) {
    console.log("[trace][v-form] loadError");
    loadMetadataAsError(el, binding);
  };
  const knownScopes = [];
  Vue.directive("form", {
    bind(el, binding) {
      console.log("[trace][v-form] bind");
      let modifierAlias = Object.keys(binding.modifiers).join("|");
      try {
        const { modifiers } = binding;
        const isForm = "form" in modifiers;
        const isControl = "control" in modifiers;
        const isError = "error" in modifiers;
        const isInput = "input" in modifiers;
        modifierAlias = isForm ? "form" : isControl ? "control" : isError ? "error" : isInput ? "input" : "-";
        if (typeof binding.value !== "object") {
          console.error(`You are passing a «${typeof binding.value}» type in some «v-form.${modifierAlias}» directive on an element of type «${el.tagName}». Details are provided below:`);
          console.log(el);
          console.log(binding);
          console.error("Good luck. I believe in you.");
          throw new Error(`Required «v-form» directive to receive an object as parameter on «v-form.${modifierAlias}»`);
        }
        if (isForm) {
          loadForm(el, binding);
          el.setAttribute("data-v-form-type", "form");
        } else if (isControl) {
          loadControl(el, binding);
          el.setAttribute("data-v-form-type", "control");
        } else if (isError) {
          loadError(el, binding);
          el.setAttribute("data-v-form-type", "error");
        } else if (isInput) {
          loadInput(el, binding);
          el.setAttribute("data-v-form-type", "input");
        } else {
          throw new Error(`Required v-form directive to have 1 modifier: .form .control .input or .error`);
        }
        Extend_element_for_debug_purposes: {
          el.setAttribute("data-v-form-parent-id", el.$lswFormMetadata.parameters.parentId);
          el.setAttribute("data-v-form-self-id", el.$lswFormMetadata.parameters.selfId);
          const posParentBrute = knownScopes.indexOf(el.$lswFormMetadata.parameters.parentScope);
          const posSelfBrute = knownScopes.indexOf(el.$lswFormMetadata.parameters.selfScope);
          let posParent = posParentBrute;
          let posSelf = posSelfBrute;
          if (posParent === -1) {
            knownScopes.push(el.$lswFormMetadata.parameters.parentScope);
            posParent = knownScopes.length - 1;
          }
          if (posSelf === -1) {
            knownScopes.push(el.$lswFormMetadata.parameters.selfScope);
            posSelf = knownScopes.length - 1;
          }
          el.setAttribute("data-v-form-parent-scope", "{" + posParent + "}");
          el.setAttribute("data-v-form-self-scope", "{" + posSelf + "}");
        }
      } catch (error) {
        console.error(`[!] Error fetching «name» property on  Error binding «v-form.${modifierAlias}». Details provided below:`);
        console.log(el, binding);
        console.error(error);
        throw error;
      }
    },
    unbind(el) {
      delete el.$lswFormMetadata.component;
      delete el.$lswFormMetadata.element;
      delete el.$lswFormMetadata;
    }
  });
})();