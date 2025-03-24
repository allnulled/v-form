# v-form

Form management as directive for vue@2.

## Installation

```sh
npm i -s @allnulled/v-form
```

## Usage

You need `vue@2` then:

```html
<script src="node_modules/@allnulled/v-form/v-form.js" /></script>
```

It is less than 600 lines. It worths it, such intuitive that seems... obvious. Well, it's not, it's 600 lines aprox far.

## Example

This should work and serve as minimal example.

```html
<div>
  <div v-form.form="{selfScope: formScope, selfId: 'main.form', onSubmit: v => console.log(v) }"></div>
  <input v-form.input="{selfScope: formScope, selfId: 'main.form.name', parentScope: formScope, parentId: 'main.form', name: 'userName' }" type="text" />
  <input v-form.input="{selfScope: formScope, selfId: 'main.form.age', parentScope: formScope, parentId: 'main.form', name: 'userAge' }" type="text" />
  <input v-form.input="{selfScope: formScope, selfId: 'main.form.city', parentScope: formScope, parentId: 'main.form', name: 'userCity' }" type="text" />
  <div v-form.error="{parentScope: formScope, parentId: 'main.form' }"></div>
</div>
```

## Explanation

This library is to use `vue@2` directives to compose forms behaviour. The guide goes through every concept and parameter to clear.

## Goals

This library covers with 1 `vue@2` directive:

  - **Form composition.** Recursive, customizable.
     - using scopes to link parents and children.
     - using `control` and `input` (`form` would work too).
     - caring about parametric events: `onGetValue`, `onFormat`, `onError`.
     - caring about recursion on:
        - getters (`getChildren`)
        - validators (`validate`)
        - error propagators (`propagateError`)
        - success propagators (`propagateSuccess`)
  - **Form validation & feedback.** Recursive, customizable.
     - caring about css classes.
     - caring about parametric events: `onValidate`, `onValidated`, `onError`.
     - caring about tree-up error propagation, to be aware of it.
     - caring about tree-down error propagation, to notify.
     - still allowing events on every node.
  - **Form submission.**
     - Fully customizable.
     - Still chainable.

Moreover, you have explained also:

  - The minimum needed pattern to create `vue@2` components
  - Based on this library...
     - ...above it: compatible on the surface
     - ...below it: used on the inside

This centralizes all the toolchain for this topic in 1 tool, for components or final forms, or both.

## Directives

You can design, hook and nest any form workflow with only 1 vue@2 directive with 4 different modifiers:

- `v-form.form`: this is a form. It has `onSubmit` callback added.
- `v-form.control`: this is a middle point between `form` and `input`.
- `v-form.input`: this is an element that contains a value itself (input, textarea and select through `value`, others through `textContent`).
- `v-form.error`: this is to show the validation errors or fixes.

## Parameters

All of these directives have almost the same parameter typology.

It is always an object with some of these properties:

- `parentId`: `String`. The identifier of the parent element in the `parentScope`.
- `parentScope`: `Object`. The object that maps the `id-element` relationship for the parent (not necessarily the children too).
- `selfId`: `String`. The identifier of the own element in the `selfScope`.
- `selfScope`: `Object`. The object that maps the `id-element` relationship for the children (not necessarily the parent too).
- `name`: `String`. The identifier of the current node in the parent node `getValue()` returned object.
   - Only interfers on children of `form` and `control`, when `getValue()` is called from their parent.
   - It cannot colive with `onGetValue` parameter callback, as it will override the default getter behaviour.
   - It can colive with `onFormat` parameter callback, as it will be called if it uses `onGetValue` and default getter behaviour anyway.
   - Triggered by `.getValue()`.
- `onValidate`: `Function`. An optional callback to override the default behaviour that validates the node.
   - Must throw errors that inform about the validation infringement rule and about the expected behaviour.
   - The thrown error name and message is all you have to inform user about the behaviour.
   - Only exists on `form`, `control` and `input` type.
   - The behaviour differs between:
      - `input`: called after simply `.getValue()`.
      - `form` and `control`: called after `.getChildren()` + `.validate()`.
   - Triggered by `.validate()`.
- `onValidated`: `Function`. An optional callback to override the default behaviour on validation success.
   - Receives `element`.
   - Triggered by `.propagateSuccess()`.
- `onSubmit`: `Function`. An optional callback to extend the default behaviour of form submission.
   - Only exists on `form` type.
   - Receives `value, element`.
   - Triggered by `.submit()`.
- `onGetValue`: `Function`. An optional callback to override (partially on `form` and `control`, and totally on `input`) the default behaviour of `getValue()`.
   - On `input` it will not return the `.value` or `.textContent`.
   - On `control` and `form` it will not return the `.getChildren()` + `.getValue()` result.
   - Receives nothing.
   - Must return the new `value` expected to be passed to `onFormat()` directly.
   - Triggered by `.getValue()`.
- `onFormat`: `Function`. An optional callback to change the value **synchronously** at least moment on `getValue()` (default or altered behaviour).
   - Receives `value, element`.
   - Must return the new `value` expected to be returned synchronously by `getValue()`.
   - Triggered by `.getValue()`.
- `onError`: `Function`. An optional callback to extend the behaviour on error propagation.
   - Receives `error, element`.
   - Triggered by `.propagateError(error)`.

## API Injection

Every element, at HTML level, that receives a `v-form` directive, at `vue@2` level and with any of its modifiers `form, control, input, error` is extended automatically (injected) with the property `$lswFormMetadata`.

The `$el.$lswFormMetadata` has some interesting properties:

- `element`: the element.

The `$el.$lswFormMetadata.methods` holds the API of the object itself. Each type ends up as a different interface, and you will find:

- `v-form.form` has:
   - `getChildren()`
   - `getValue()`
   - `submit()`: The submit button should call it.
   - `validate()`: The validate button should call it.
   - `propagateSuccess()`
   - `propagateError(error)`

- `v-form.control` has:
   - `getChildren()`
   - `getValue()`
   - `validate()`: Any (intermediate) validate button should call it.
   - `propagateSuccess()`
   - `propagateError(error)`

- `v-form.input` has:
   - `getChildren()`
   - `getValue()`
   - `validate()`: Any (intermediate) validate button should call it.
   - `propagateSuccess()`
   - `propagateError(error)`

- `v-form.error` has:
   - `setError(error)`
   - `clearError()`
   - `propagateSuccess()`
   - `propagateError(error)`

These methods, always under `$el.$lswFormMetadata.methods` are explained here:

- `methods.getChildren()`:
   - Returns all `HTMLElement` that:
      - ...have `v-form` directive, with any modifier (`.form`, `.control`, `.input`, `.error`).
      - ...its parameters match `$current.selfScope=$child.parentScope` and `$current.selfId=$child.parentId`
- `methods.getValue()`:
   - Returns the value of the node in the form.
   - The behaviour differs between modifiers.
      - On `error`, it does not exist.
      - On `input`, it returns the `.value` from `textarea, input, select` and `.textContent` from any other.
      - On `control` and `form`, it returns the result of all `.getValue()` from all `.getChildren()` properly assembled.
- `methods.validate()`:
   - Calls to validation on the current and all possible subelements, handling the success and error adecuately.
   - On `error`, it does not exist. *Errors do not validate theirselves*.
   - On `input`, it just calls `getValue()` + `onValidate(value, element, directiveComponent)` + `propagateSuccess()`.
   - On `form` and `control`, it calls `getChildren()` and iterates doing `child.validate()`
      - If this throws an error, accumulates the error.
      - Unifies the errors in 1.
      - Calls to `propagateError(unifiedError)` which works tree-up in this case.
      - Then it throws it, making.
      - But if this does not throw an error, it call to `propagateSuccess()`.

This is a lapse.

When we say `TREE-UP`, we mean through a `current.parentScope` matcher.

When we say `TREE-DOWN`, we mean through a `current.selfScope` matcher. The name could or maybe should have been `childrenScope` and `selfId`, ahhh, there you have it, why not.

Continue, please.

- `methods.propagateError(error)`:
   - Propagates the error to all other nodes.
   - The error on validation **propagates TREE-UP**.
      - But this is only for user feedback, so only `error` types will get aware of this propagation.
      - This implies that each node accumulates an error summarizing the children errors.
   - The error on validation also **propagates TREE-DOWN**.
      - But this is only for user feedback, so only `error` types will get aware of this propagation.
      - This implies that to show errors, you have to bind `v-form.error` as child of the node whose error (or success) you want to show.
- `methods.propagateSuccess()`:
   - Propagates the validation success to all other nodes.
   - The success on validation **propagates TREE-DOWN** only.
      - But this is only for user feedback, so only `error` types will get aware of this propagation.
      - The `error` type can change its state to `successBox`, representing an error or a success, so maybe the name is not the best.

Then, on `form` you have also:

- `methods.submit()`:
   - Executes the action of the form.
   - Calls to `validate()` before doing it. Can be overriden with `onValidate`.
   - Calls to `onSubmit` if provided.
   - If it fails, it will show the unified error.

And then, on `error` type you have:

- `methods.setError(error)`:
   - Sets the `.textContent` of the element as a `${error.name}: ${error.message}` string.
   - Adds to the `.class` of the element the `errorBox` class.
- `methods.clearError()`:
   - Clears the `.textContent` of the element.
   - Adds to the `.class` of the element the `successBox` class.

This is all the possible methods found on `$el.$lswFormMetadata.methods`.

# Advanced patterns

This section describes patterns that are not only a fast form.

## To customize validations

Use the `onValidate` callback parameter.

## To show errors

To take profit from validation, use the `onValidate` parameter callback to throw errors.

Then, bind a `v-form.error` as son of the `v-form.{control, input, form}`.

This is made by making `parentScope` and `parentId` of error match the `selfScope` and `selfId` of the `control, input or form`.

## To create components

If you plan to build components using this library, you only need to remember this:

> The component needs to receive on **props** the **parentScope** and **parentId** to become *boundable from the outer markup*.

This is it. If you understand this, you can break the API wherever you want.

# Real case

This is a components used as MultipleInput in a agenda. The template goes as follows:

```html
<div>
    <div class="form_structure"
        v-form.form="formMetadata.form"
        ref="agenda_form">
        <div class="form_item text_align_right">
            <button v-on:click="() => $refs.agenda_form.$lswFormMetadata.methods.submit()">Submit</button>
        </div>
        <div class="form_item"
            v-for="field, fieldIndex in formMetadata.fields"
            v-bind:key="'form_field_' + fieldIndex">
            <div class="form_label">
                <div class="enunciate_box2">
                    <div class="enunciate">
                        <span class="enunciate_text">{{ fieldIndex + 1 }}. {{ field.enunciate }}</span>
                        <span class="coderef">
                            <span class="codenote as_note">como</span>
                            <span class="codetext codetype">{{ field.code3 }}</span>
                            <span class="codenote as_note">en</span>
                            <span class="codetext codetype">{{ field.code1 }}</span>
                        </span>
                        <span class="explanation_block">
                            <span class="iconref"
                                style="flex:100;">
                                <span class="info_icon"
                                    v-on:click="() => toggleExplanation(field.code2)">ℹ️</span>
                            </span>
                            <span class="explanation"
                                v-if="expandedExplanations.indexOf(field.code2) !== -1">{{ field.explanation }}</span>
                        </span>
                    </div>
                </div>
            </div>
            <template v-if="field.type === 'input'">
                <input class="form_control"
                    type="text"
                    :placeholder="field.placeholder"
                    v-form.input="field.inputConfig" />
                <div class="validationBox"
                    v-form.error="field.errorConfig"></div>
            </template>
            <template v-else-if="field.type === 'textarea'">
                <textarea class="form_control"
                    :placeholder="field.placeholder"
                    v-form.input="field.inputConfig" />
                <div class="validationBox"
                    v-form.error="field.errorConfig"></div>
            </template>
            <template v-else-if="field.type === 'select'">
                <select class="form_control" v-form.input="field.inputConfig">
                    <option :value="option.value" v-for="option, optionIndex in field.options" v-bind:key="'field_' + fieldIndex + '_selector_option_' + optionIndex">
                        {{ option.text }}
                    </option>
                </select>
                <div class="validationBox"
                    v-form.error="field.errorConfig"></div>
            </template>
        </div>
        <div class="form_item text_align_right">
            <button v-on:click="() => $refs.agenda_form.$lswFormMetadata.methods.submit()">Submit</button>
        </div>
    </div>
</div>
```

Then, in the logic, I can just:

```js
Vue.component("LswAgendaForm", {
  template: $template,
  props: {
    formMetadata: {
      type: Object,
      required: true,
    }
  },
  data() {
    this.$trace("lsw-agenda-form.data");
    this.validateFormMetadata(this.formMetadata);
    return {
      expandedExplanations: [],
      formScope: {},
      formState: {}
    };
  },
  methods: {
    validateFormMetadata(v) {
      const isObject = typeof v === "object";
      const hasFormAsObject = typeof v.form === "object";
      const hasFieldsAsArray = Array.isArray(v.fields);
      if(!isObject) {
        throw new Error("Required parameter «formMetadata» to be an object on «LswAgendaForm.methods.validateFormMetadata»");
      }
      if(!hasFormAsObject) {
        throw new Error("Required parameter «formMetadata.form» to be an object on «LswAgendaForm.methods.validateFormMetadata»");
      }
      if(!hasFieldsAsArray) {
        throw new Error("Required parameter «formMetadata.fields» to be an array on «LswAgendaForm.methods.validateFormMetadata»");
      }
    },
    toggleExplanation(id) {
      const pos = this.expandedExplanations.indexOf(id);
      if(pos === -1) {
        this.expandedExplanations.push(id);
      } else {
        this.expandedExplanations.splice(pos, 1);
      }
    },
    loadFields() {
      this.$window.F = this.$refs.agenda_form;
    }
  },
  watch: {},
  mounted() {
    try {
      this.$trace("lsw-agenda-form.mounted");
      this.loadFields();
    } catch(error) {
      console.log(error);
    }
  }
});
```

Finally, I can compose forms (that only support input as string or option, but customizable) like this:

```html
<lsw-agenda-form :form-metadata="formMetadata"></lsw-agenda-form>
```

And the required logic from this components is just 1 attribute. Which tells like this:

```js

Vue.component("LswAgendaAccionAdd", {
  template: $template,
  props: {},
  data() {
    this.$trace("lsw-agenda-accion-add.data");
    return {
      en_concepto_de: "",
      tiene_duracion: "",
      tiene_inicio: "",
      tiene_emociones: "",
      tiene_detalles: "",
      tiene_descripcion: "",
      tiene_pasos: "",
      tiene_razonamiento: "",
      tiene_expectativas: "",
      has_learning: "",
      tiene_intenciones: "",
      tiene_resultados: "",
      tiene_historial: "",
      tiene_consecuencias: "",
      // Campos para el formulario:
      formScope: Object.freeze({}), // El scope que usará el formulario que queremos.
      formMetadata: false, // Los metadatos, que incluyen fields y form.
    };
  },
  methods: {
    loadFormMetadata() {
      const outterFormScope = {};
      const fields = [{
        type: "input",
        enunciate: "Concepto al que se refiere:",
        code1: "it.en_concepto_de",
        code2: "en_concepto_de",
        code3: "string",
        explanation: "tiene que coincidir con el «tiene_nombre» del concepto para que funcionen los propagadores correspondientes.",
        placeholder: "Ej: Desayunar",
        errorConfig: {
          parentId: "en_concepto_de",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "en_concepto_de",
          selfScope: outterFormScope,
          name: "en_concepto_de"
        }
      }, {
        type: "input",
        enunciate: "Duración:",
        code1: "it.tiene_duracion",
        code2: "tiene_duracion",
        code3: "string",
        explanation: "tiene que cumplir con el formato «0y 0mon 0d 0h 0min 0s» para referir a una duración.",
        placeholder: "Ej: 0y 0mon 0d 0h 0min",
        errorConfig: {
          parentId: "tiene_duracion",
          parentScope: outterFormScope,
          onSuccessStatus: {
            name: "OK",
            message: "El campo cumple con un formato válido."
          }
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_duracion",
          selfScope: outterFormScope,
          name: "tiene_duracion",
          onValidate: function(value) {
            const result = Timeformat_parser.parse(value);
            if(result.length !== 1) {
              throw new Error("Only 1 expression allowed");
            }
            if(result[0].tipo !== "Duracion") {
              throw new Error("Only 1 expression of type «Duración» allowed");
            }
          }
        }
      }, {
        type: "input",
        enunciate: "Inicio:",
        code1: "it.tiene_inicio",
        code2: "tiene_inicio",
        code3: "string",
        explanation: "tiene que cumplir con el formato «2025/01/01 23:59» para ser válido.",
        placeholder: "2025/01/01 00:00",
        errorConfig: {
          parentId: "tiene_inicio",
          parentScope: outterFormScope,
          onSuccessStatus: {
            name: "OK",
            message: "El campo cumple con un formato válido."
          }
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_inicio",
          selfScope: outterFormScope,
          name: "tiene_inicio",
          onValidate: function(value) {
            const result = Timeformat_parser.parse(value);
            if(result.length !== 1) {
              throw new Error("Only 1 expression allowed");
            }
            if(result[0].tipo !== "FechaHora") {
              throw new Error("Only 1 expression of type «FechaHora» allowed");
            }
          }
        }
      }, {
        type: "select",
        enunciate: "Estado:",
        code1: "it.has_state",
        code2: "has_state",
        code3: "string",
        explanation: "tiene que ser uno entre «pendiente», «fallido» y «completo»",
        options: [{
          value: "pendiente",
          text: "Pendiente"
        }, {
          value: "fallido",
          text: "Fallido"
        }, {
          value: "completo",
          text: "Completo"
        }],
        errorConfig: {
          parentId: "has_state",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "has_state",
          selfScope: outterFormScope,
          name: "has_state"
        }
      }, {
        type: "input",
        enunciate: "Emociones asociadas:",
        code1: "it.tiene_emociones",
        code2: "tiene_emociones",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_emociones",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_emociones",
          selfScope: outterFormScope,
          name: "tiene_emociones"
        }
      }, {
        type: "input",
        enunciate: "Detalles:",
        code1: "it.tiene_detalles",
        code2: "tiene_detalles",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_detalles",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_detalles",
          selfScope: outterFormScope,
          name: "tiene_detalles"
        }
      }, {
        type: "input",
        enunciate: "Descripción:",
        code1: "it.tiene_descripcion",
        code2: "tiene_descripcion",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_descripcion",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_descripcion",
          selfScope: outterFormScope,
          name: "tiene_descripcion"
        }
      }, {
        type: "input",
        enunciate: "Pasos:",
        code1: "it.tiene_pasos",
        code2: "tiene_pasos",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_pasos",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_pasos",
          selfScope: outterFormScope,
          name: "tiene_pasos"
        }
      }, {
        type: "input",
        enunciate: "Razonamiento:",
        code1: "it.tiene_razonamiento",
        code2: "tiene_razonamiento",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_razonamiento",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_razonamiento",
          selfScope: outterFormScope,
          name: "tiene_razonamiento"
        }
      }, {
        type: "input",
        enunciate: "Expectativas:",
        code1: "it.tiene_expectativas",
        code2: "tiene_expectativas",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_expectativas",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_expectativas",
          selfScope: outterFormScope,
          name: "tiene_expectativas"
        }
      }, {
        type: "input",
        enunciate: "Aprendizaje:",
        code1: "it.has_learning",
        code2: "has_learning",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "has_learning",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "has_learning",
          selfScope: outterFormScope,
          name: "has_learning"
        }
      }, {
        type: "input",
        enunciate: "Intención:",
        code1: "it.tiene_intenciones",
        code2: "tiene_intenciones",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_intenciones",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_intenciones",
          selfScope: outterFormScope,
          name: "tiene_intenciones"
        }
      }, {
        type: "input",
        enunciate: "Resultado:",
        code1: "it.tiene_resultados",
        code2: "tiene_resultados",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_resultados",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_resultados",
          selfScope: outterFormScope,
          name: "tiene_resultados"
        }
      }, {
        type: "input",
        enunciate: "Historia:",
        code1: "it.tiene_historial",
        code2: "tiene_historial",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_historial",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_historial",
          selfScope: outterFormScope,
          name: "tiene_historial"
        }
      }, {
        type: "input",
        enunciate: "Consequencias:",
        code1: "it.tiene_consecuencias",
        code2: "tiene_consecuencias",
        code3: "string",
        explanation: "blablabla.",
        placeholder: "blabla",
        errorConfig: {
          parentId: "tiene_consecuencias",
          parentScope: outterFormScope,
        },
        inputConfig: {
          parentId: "formularioInicial",
          parentScope: outterFormScope,
          selfId: "tiene_consecuencias",
          selfScope: outterFormScope,
          name: "tiene_consecuencias"
        }
      }, ];
      this.formMetadata = Object.freeze({
        form: {
          selfScope: outterFormScope,
          selfId: "formularioInicial",
          onSubmit: async (value) => {
            const id = await this.$lsw.database.insert("accion", value);
            console.log("ID:", id);
            this.$parent.selectContext("agenda");
          }
        },
        fields: fields,
      });
    }
  },
  watch: {},
  mounted() {
    try {
      this.$trace("lsw-agenda-accion-add.mounted");
      this.loadFormMetadata();
    } catch(error) {
      console.log(error);
    }
  }
});
```

If you see well, almost all the definition is just the JSON of the form.

# Conclusion

No, this package is not documented for marketing purposes. But I am providing a solution for any case, with least code intrusion possible, and with the key patterns to continue, if you want.