### Aurelia-template-lint-typescript

Proof of concept for type safety in aurelia views when using typescript

##### Install and run
1. npm install
2. node index.js

![img](http://i.imgur.com/Nm7yyLG.png)

##### Implementation
First gulp-typedoc is used to extract typedoc information from a view-model (in this case, test.ts)

```
{
	"id": 0,
	"name": "aurelia-template-lint-typescript",
	"kind": 0,
	"flags": {},
	"children": [
		{
			"id": 1,
			"name": "\"test\"",
			"kind": 1,
			"kindString": "External module",
			"flags": {
				"isExported": true
			},
			"originalName": "D:/Development/aurelia-template-lint-typescript/test.ts",
			"children": [
				{
					"id": 2,
					"name": "Test",
					"kind": 128,
					"kindString": "Class",
					"flags": {
						"isExported": true
					},
					"children": [
						{
							"id": 3,
							"name": "username",
							"kind": 1024,
							"kindString": "Property",
							"flags": {
								"isExported": true
							},
							"type": {
								"type": "instrinct",
								"name": "string"
							}
						}
					],
					"groups": [
						{
							"title": "Properties",
							"kind": 1024,
							"children": [
								3
							]
						}
					]
				}
			],
			"groups": [
				{
					"title": "Classes",
					"kind": 128,
					"children": [
						2
					]
				}
			]
		}
	],
	"groups": [
		{
			"title": "External modules",
			"kind": 1,
			"children": [
				1
			]
		}
	]
}
```


Then we extract all properties from the first class out of this typedoc: ["username"]


Then an HTML file is loaded and parsed as HTML. Then we iterate over all elements and extract expressions from value.bind attributes (this should be extended to extract more expressions and more complex ones)

```
<template>
  <input type="text" value.bind="username"/>
  <input type="text" value.bind="someOtherProperty"/>
</template>
```

Result: ["username", "someOtherProperty"]

Using aurelia's binding system we parse these expressions into AccessScopes:

```
AccessScope {
  isChain: false,
  isAssignable: true,
  name: 'username',
  ancestor: 0 }
Found property 'username' on the view-model
AccessScope {
  isChain: false,
  isAssignable: true,
  name: 'someOtherProperty',
  ancestor: 0 }
  ```

  For now we just simply check if the name of the AccessScope is also in the array of properties we extracted from typedoc, but we should be able to use aurelia-binding to check for complex expressions as well, such as "myObj.something[0].abcd"
