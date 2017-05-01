pchatter
===

Twitter連携お絵かきチャットサービス

### 環境
* Ruby 2.3以上
* Node.js 7.6以上
  * yarnも必要
  * [node-canvas](https://github.com/Automattic/node-canvas)の依存パッケージ
* MySQL 5.7.8以上
* Redis 2以上

## 設定ファイルの編集
`application.yml.example`をコピーして編集

```bash
$ cp config/application.yml{.example,}
```

以下のコマンドの出力結果を`SECRET_KEY_BASE`に設定する

```
$ bundle exec rake secret
```

## 開発向けセットアップ
### インストール
```bash
$ bundle install --path vendor/bundle
$ bundle exec rails db:create
$ bundle exec rails db:migrate
$ npm install
```

### 実行

```bash
$ npm start
```

Railsのサーバが3000番ポートで、Node.jsのサーバが4000番ポートで起動する
