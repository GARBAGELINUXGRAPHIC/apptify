# create-apptify

Create an editable Vue app with Apptify navigation, settings, account forms, 404 and component examples. Requires Node.js 22 or later.

```sh
npm create apptify@latest my-app
cd my-app
npm install
npm run dev
```

The target must be empty. Omit `my-app` or use `.` to create in the current empty directory. Edit pages in `playground/views/` and navigation in `playground/App.vue`. Account forms need your own backend.

Uses the generator and template shipped with `apptify`. The generated app includes a portable library archive in `vendor/`.

## Release

This is a separate npm package. From this directory:

```sh
npm pack
npm publish --access public
```
