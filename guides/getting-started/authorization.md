# Authorization

Each request needs to include a header with a basic API Key generated in your company settings.

> **Note:** Make sure you store the key in a secured place since it will not be visible later.

After generating the key, it should be included in every API request as the following header:

```json
{
  "x-api-key": "<your-api-key>"
}
```
