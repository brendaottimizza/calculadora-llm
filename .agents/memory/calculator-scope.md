---
name: Escopo da calculadora
description: Requisito permanente de disponibilidade de modelos na comparação de custos.
---

Os modelos da AionLabs devem sempre aparecer na lista, mesmo se não estiverem na API externa.

**Why:** Requisito explícito do usuário no documento de criação da calculadora.

**How to apply:** Ao atualizar a fonte do catálogo ou o fallback, preservar essa disponibilidade. Dados locais demonstrativos não devem ser apresentados como tarifas atuais verificadas.
