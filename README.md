# ...
Usar de wwebjs `client.group_admin_changed()` caso eu não seja o criador do grupo ou seja criador e tenha saído. Para evitar perder o grupo.

Convites url whatsapp redefinido não tem como pegaro id do grupo.

## Bugs a corrigir
veja o arquivo `groupsWpp/contar grupos.py`. Há algum erro ou no calculo ou em como estou processando as urls de entradas pois os calculos não estão batendo.

Verificar se tem url repetida.

## Status
Grupos de anime que não precisa aceitação já peguei os links.

Falta os links de grupos que precisa aceitar para eu entrar. Apenas rodar o main.js de enterGroups que ja esta preparado para pular os grupos ja pegos e pegar os outros grupos inclusive se ja estou dentro dos grupos que precisam de aprovação para pegar os contatos.

# Mensagem de erro do node que pode resultar em inabilidade de usar as lib
```
(node:16888) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
```

# Documnetação
O arquivo `metadata.db` contem as pesquisas que foram feitas no google.
