# CDS Change Log

> provide the `ChangeLog` best practice for SAP CAP nodejs runtime

[![node-test](https://github.com/Soontao/cds-change-log/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Soontao/cds-change-log/actions/workflows/nodejs.yml)
[![npm](https://img.shields.io/npm/v/cds-change-log)](https://www.npmjs.com/package/cds-change-log)
![NPM](https://img.shields.io/npm/l/cds-change-log)
![node-lts](https://img.shields.io/node/v-lts/cds-change-log)

[![codecov](https://codecov.io/gh/Soontao/cds-change-log/branch/main/graph/badge.svg?token=kKkSYJyTfG)](https://codecov.io/gh/Soontao/cds-change-log)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Soontao_cds-change-log&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Soontao_cds-change-log)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Soontao_cds-change-log&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Soontao_cds-change-log)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/cds-change-log)

## Get Started

> `package.json`

```json
{
  "cds": {
    "plugins": [
      "cds-change-log"
    ]
  }
}
```

> `entity.cds`

- **MUST** `using from 'cds-change-log'` statement in CDS model
- **MUST** annotating `@cds.changelog.enabled` on elements
- **MUST** annotating at the root/raw `entity` level, annotations on `projection`/`view` will not work
- **MUST** have at least one **PRIMARY KEY**

```groovy
using {cap.community.common} from 'cds-change-log'

entity People : cuid, managed, customManaged {
  Name       : String(255);
  Age        : Integer;
  changeLogs : Association to many common.ChangeLog
                 on  changeLogs.entityKey  = $self.ID
                 and changeLogs.entityName = 'People';
}

// mark in entity and field elements level
// annotation in another place, you can put it into entity definition directly
annotate People with {
  Age  @cds.changelog.enabled;
  Name @cds.changelog.enabled;
};
```

> `create and update objects`

```js
let response = await axios.post("/sample/Peoples", { Name: "Theo Sun 2", Age: 39 })
const { ID } = response.data
await axios.patch(`/sample/Peoples(${ID})`, { Name: "Theo Sun 9", Age: 12 })
```

> `generated change logs`

<details>
  <summary>Click to expand sample logs</summary>

```js
[
  {
    ID: "595b3604-d7dd-434f-962c-1e70e92bd775",
    actionAt: "2022-03-17T04:20:41.402Z",
    actionBy: "anonymous",
    entityName: "People",
    entityKey: "0e926ff2-53ad-4cd9-9569-ad2147dad0bc",
    action: "Create",
    Items: [
      {
        sequence: 0,
        Parent_ID: "595b3604-d7dd-434f-962c-1e70e92bd775",
        attributeKey: "Name",
        attributeNewValue: "Theo Sun 2",
        attributeOldValue: null,
      },
      {
        sequence: 1,
        Parent_ID: "595b3604-d7dd-434f-962c-1e70e92bd775",
        attributeKey: "Age",
        attributeNewValue: "39",
        attributeOldValue: null,
      },
    ],
  },
  {
    ID: "55bca8b8-1e79-4c9b-8bc9-1a013bf3cf39",
    actionAt: "2022-03-17T04:20:41.461Z",
    actionBy: "anonymous",
    entityName: "People",
    entityKey: "0e926ff2-53ad-4cd9-9569-ad2147dad0bc",
    action: "Update",
    Items: [
      {
        sequence: 0,
        Parent_ID: "55bca8b8-1e79-4c9b-8bc9-1a013bf3cf39",
        attributeKey: "Name",
        attributeNewValue: "Theo Sun 9",
        attributeOldValue: "Theo Sun 2",
      },
      {
        sequence: 1,
        Parent_ID: "55bca8b8-1e79-4c9b-8bc9-1a013bf3cf39",
        attributeKey: "Age",
        attributeNewValue: "12",
        attributeOldValue: "39",
      },
    ],
  },
]
```
</details>



### Custom Type Primary Key

> if you want to use `Integer` or other cds built-in type as primary key

`entity.cds`

```groovy
@cds.changelog.enabled
entity Order : managed { // a sample entity
  key ID     : Integer; // use Integer as key, not out-of-box UUID
      @cds.changelog.enabled
      Amount : Decimal;
};
```

`extension.cds`

```groovy
// remember using this file from your project root
using {cap.community.common.ChangeLog} from 'cds-change-log';

extend ChangeLog with {

  // add a new column 'entityKeyInteger' for integer key
  @cds.changelog.extension.entityKey
  // this column will be used when entity use `Integer` as primary key
  // MUST add the `cds.` prefix for built-in types
  @cds.changelog.extension.for.type : cds.Integer 
  entityKeyInteger : Integer;
  
};

```

### Multi Primary Keys on target entity

> if you want to **manually** specify the data storage for entity keys

`entity.cds`

```groovy
@cds.changelog.enabled
entity PeopleOrderForProduct {
      // store key to ChangeLog.entityKeyInteger
      @cds.changelog.extension.key.target : 'entityKeyInteger'
  key OrderID  : Integer;
      // store key to ChangeLog.entityKey
      @cds.changelog.extension.key.target : 'entityKey'
  key PeopleID : UUID;
      @cds.changelog.enabled
      Amount   : Decimal;
}
```

## Features

- [x] single `CUD` OData requests 
- [x] multi `CUD` CQL
- [x] all `Update/Delete` CQL (without `where`)
- [x] aspect support
- [x] localization support
- [x] custom type key (e.g. Integer) support
  - [x] metadata cache
- [x] multi primary key support
- [x] extension field support
- [ ] draft mode (`draftActivate`)
  - [x] simple single entity
  - [ ] localization
- [ ] key relation cache
- [ ] built-in FE UI Annotations
- [ ] save change logs in async mode
- [ ] benchmark test
- [ ] subscribe change log event
- [ ] validation at startup
- [ ] skip/warn log for `Blob`
- [ ] secondary storage like mongo/s3
- [ ] readable identifier support
- [ ] association/composition support
  - [ ] annotation `@cds.changelog.to`
- [ ] Samples
  - [ ] localized data sample
  - [ ] for fiori elements
  - [ ] rows to columns table records

## [CHANGELOG](./CHANGELOG.md)

## [LICENSE](./LICENSE)
