
# :checkered_flag: LIVRESSE

Site para realizar leilões de livros

## :technologist: Membros da equipe

Francisco Ytalo Nunes Batista - 540432 - CIência da computação

## :people_holding_hands: Papéis ou tipos de usuário da aplicação

- Usuário não cadastrado
- Usuário cadastrado
- Leiloeiro 

## :spiral_calendar: Papéis ou tipos de usuário da aplicação

- Leilão
- Item
- Lance
- Usuário


## :triangular_flag_on_post:	 Principais funcionalidades da aplicação

- Usuário não cadastrado apenas pode ver o leioões que estão acontecendo.
- Usuário cadastrado pode ver o leilões que estão acontecendo, e realizar lances
- Leiloeiro pode criar, iniciar e dar fim aos leilões.


----

:warning::warning::warning: As informações a seguir devem ser enviadas juntamente com a versão final do projeto. :warning::warning::warning:


----

## :desktop_computer: Tecnologias e frameworks utilizados

**Frontend:**

Vue, css, bootstrapo.

**Backend:**

Strapi, pinia, TS.


## :shipit: Operações implementadas para cada entidade da aplicação


| Entidade| Criação | Leitura | Atualização | Remoção |
| --- | --- | --- | --- | --- |
| user| X |  X  |  |  | 
| book | X |   X |  |  X  |  | 
| lance| X|  X |  |  |

> Lembre-se que é necessário implementar o CRUD de pelo menos duas entidades.

## :neckbeard: Rotas da API REST utilizadas

| Método HTTP | URL |
| --- | --- |
| GET | api/books/|
| POST | api/auth/local|

