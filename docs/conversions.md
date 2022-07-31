# Conversions

In order to provide summaries of needs assessment forms, conversion instructions
can be defined per question.

The are added to the definition of a questions like this:

```json
{
  "id": "cannedTomatoes",
  "title": "Canned Tomatoes",
  "format": {
    "type": "positive-integer",
    "units": [
      {
        "id": "epal",
        "title": "Euro pallets",
        "baseUnit": {
          "id": "cans",
          "title": "Cans (#10 kitchen size)",
          "conversionFactor": 384
        }
      },
      {
        "id": "cans",
        "title": "Cans (#10 kitchen size)"
      }
    ]
  }
}
```

## Unit conversion table

Below is the unit conversion table. Please see the first row which shows an
example definition of a question that defines three units for `Water`, where the
base unit is liters, and also provides two alternative units and the factor that
converts the alternative unit to the base unit. The second row is another
example that converts meters to centimeter and inches.

For example: `Washing Detergent` has `1L bottle` and `5k bag` as units, however
they cannot be directly converted to each other. In this case a super-unit
(`wash cycles`) needs to be added, which allows to compare both units.

| Name              | Base unit               | Alternative 1 | In Base Unit | Alternative 2 | In Base Unit |
| ----------------- | ----------------------- | ------------- | ------------ | ------------- | ------------ |
| Water             | Liter                   | 5L bottle     | 5            | 333 ml can    | 0.333        |
| Rope              | meters                  | centimeters   | 0.01         | inches        | 0.0254       |
| Washing Detergent | wash cycles             | 1L bottle     | 38           | 5k bag        | 90           |
| Rice              | Kilogram                | Euro pallets  | 760          |               |              |
| Potatoes          | Kilogram                | Euro pallets  | 1375         |               |              |
| Onions            | Kilogram                | Euro pallets  | 1300         |               |              |
| Garlic            | Kilogram                | Euro pallets  | 745          |               |              |
| Flour             | Kilogram                | Euro pallets  | 420          |               |              |
| Salt              | Kilogram                | Euro pallets  | 1000         |               |              |
| Sugar             | Kilogram                | Euro pallets  | 1000         |               |              |
| Oil               | Liter                   | Euro pallets  | 972          |               |              |
| Milk              | Liter                   | Euro pallets  | 840          |               |              |
| Canned Tomatoes   | Cans (№10 kitchen size) | Euro pallets  | 384          |               |              |
| Canned Beans      | Cans (№10 kitchen size) | Euro pallets  | 384          |               |              |
| Canned Fish       | Cans (№10 kitchen size) | Euro pallets  | 384          |               |              |
| Sweetcorn         | Cans (№10 kitchen size) | Euro pallets  | 384          |               |              |
| Tea               | Kilogram                | Euro pallets  | 235          | servings      | 0.003        |
| Coffee            | Kilogram                | Euro pallets  | 340          | servings      | 0.01         |

The conversions here are based on
[this spreadsheet](https://docs.google.com/spreadsheets/d/14lOb1s8fwB9RwKzqWbmWFafeksjkbqj6AYMmSbD7srU/edit?usp=sharing).
