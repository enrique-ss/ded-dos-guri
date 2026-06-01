/**
 * D&D dos Guri – Banco de Dados do Sistema
 * Contém raças, classes, perícias, antecedentes e condições.
 */

const RACES = {
    humano: { name: 'Humano', modsDesc: '+1 em 3 atributos à escolha', feature: 'Aprendiz Rápido: Ganha 1 Talento (Feat) no nível 1.', speed: 9, attrMods: { type: 'flexible', points: 3, value: 1 } },
    elfo: { name: 'Elfo', modsDesc: '+2 Destreza, +1 Inteligência', feature: 'Sentido Aguçado: Visão no escuro e imunidade a sono mágico.', speed: 9, attrMods: { type: 'fixed', mods: { des: 2, int: 1 } } },
    anao: { name: 'Anão', modsDesc: '+2 Constituição, +1 Força', feature: 'Resiliência: Resistência a veneno e +1 PV por nível.', speed: 7.5, attrMods: { type: 'fixed', mods: { con: 2, for: 1 } } },
    halfling: { name: 'Halfling', modsDesc: '+2 Destreza, +1 Carisma', feature: 'Sorte: Pode relançar qualquer resultado "1" no dado.', speed: 7.5, attrMods: { type: 'fixed', mods: { des: 2, car: 1 } } },
    meio_elfo: { name: 'Meio-Elfo', modsDesc: '+2 Carisma, +1 em outros 2', feature: 'Versatilidade: Proficiência em 2 perícias extras.', speed: 9, attrMods: { type: 'flexible', points: 2, value: 1, fixedMods: { car: 2 } } },
    meio_orc: { name: 'Meio-Orc', modsDesc: '+2 Força, +1 Constituição', feature: 'Tenacidade: Se cair a 1 HP, consegue se levantar e dar um ultimo ataque antes de desmaiar.', speed: 9, attrMods: { type: 'fixed', mods: { for: 2, con: 1 } } },
    tiefling: { name: 'Tiefling', modsDesc: '+2 Carisma, +1 Inteligência', feature: 'Legado: Resistência a fogo e 1 Truque mágico (Cantrip).', speed: 9, attrMods: { type: 'fixed', mods: { car: 2, int: 1 } } },
    gnomo: { name: 'Gnomo', modsDesc: '+2 Inteligência, +1 Const.', feature: 'Mente Astuta: Vantagem em salvaguardas mentais contra magia.', speed: 7.5, attrMods: { type: 'fixed', mods: { int: 2, con: 1 } } }
};

const CLASSES = {
    guerreiro: { name: 'Guerreiro', icon: '⚔️', hp: 10, saves: ['for', 'con'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    ladino: { name: 'Ladino', icon: '🗡️', hp: 8, saves: ['des', 'int'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas de mão, espadas curtas, rapieiras e espadas longas.', skillsDesc: 'Escolha 4: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, Intimidação... +Ferramentas de Ladrão.', skillChoices: 4, allowSkills: ['acrobatics', 'athletics', 'performance', 'deception', 'stealth', 'intimidation', 'insight', 'investigation', 'perception', 'persuasion', 'sleight'] },
    mago: { name: 'Mago', icon: '🪄', hp: 6, saves: ['int', 'sab'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves. (Nenhuma armadura).', skillsDesc: 'Escolha 2: Arcanismo, História, Investigação, Medicina e Religião.', skillChoices: 2, allowSkills: ['arcana', 'history', 'investigation', 'medicine', 'religion'] },
    clerigo: { name: 'Clérigo', icon: '✨', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e médias, escudos e armas simples.', skillsDesc: 'Escolha 2: História, Intuição, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    paladino: { name: 'Paladino', icon: '🛡️', hp: 10, saves: ['sab', 'car'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Atletismo, Intuição, Intimidação, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    barbaro: { name: 'Bárbaro', icon: '🪓', hp: 12, saves: ['for', 'con'], hd: '1d12', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    bardo: { name: 'Bardo', icon: '🪕', hp: 8, saves: ['des', 'car'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas, espadas. +3 Instrumentos.', skillsDesc: 'Escolha 3 quaisquer (O Bardo é o "pau para toda obra").', skillChoices: 3, allowSkills: 'all' },
    patrulheiro: { name: 'Patrulheiro', icon: '🏹', hp: 10, saves: ['for', 'des'], hd: '1d10', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 3: Adestrar Animais, Atletismo, Intuição, Investigação, Natureza... Furtividade.', skillChoices: 3, allowSkills: ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'survival', 'stealth'] },
    feiticeiro: { name: 'Feiticeiro', icon: '🔮', hp: 6, saves: ['con', 'car'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, Intuição, Intimidação, Persuasão e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    bruxo: { name: 'Bruxo', icon: '💀', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e armas simples.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, História, Intimidação, Investigação, Natureza e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    druida: { name: 'Druida', icon: '🌿', hp: 8, saves: ['int', 'sab'], hd: '1d8', armor: 'Armaduras leves e médias (não usam metal!), escudos, clavas, lanças...', skillsDesc: 'Escolha 2: Adestrar Animais, Arcanismo, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'arcana', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] }
};

const BACKGROUNDS = {
    acolito: { name: 'Acólito', desc: 'Você serviu em um templo e possui conhecimentos religiosos e rituais.' },
    charlatao: { name: 'Charlatão', desc: 'Um mestre da manipulação e truques, viveu de enganar os outros.' },
    criminoso: { name: 'Criminoso', desc: 'Você tem contatos no submundo e experiência em atividades ilegais.' },
    animador: { name: 'Animador', desc: 'Ator, músico ou gladiador; você sabe como entreter uma plateia.' },
    heroi: { name: 'Herói do Povo', desc: 'Você veio de uma origem humilde e se tornou um defensor dos plebeus.' },
    artesao: { name: 'Artesão de Guilda', desc: 'Membro de uma guilda mercantil, perito em um ofício específico.' },
    eremita: { name: 'Eremita', desc: 'Você viveu em isolamento e descobriu um segredo ou iluminação.' },
    nobre: { name: 'Nobre', desc: 'Você nasceu em uma família influente e possui privilégios sociais.' },
    forasteiro: { name: 'Forasteiro', desc: 'Um sobrevivente das terras selvagens, acostumado a ambientes rudes.' },
    sabio: { name: 'Sábio', desc: 'Um estudioso dedicado à busca pelo conhecimento acadêmico.' },
    marinheiro: { name: 'Marinheiro', desc: 'Um lobo do mar, experiente em navios e navegação.' },
    soldado: { name: 'Soldado', desc: 'Você foi treinado para a guerra e serviu em um exército ou guarda.' },
    orfao: { name: 'Órfão', desc: 'Você cresceu nas ruas, sobrevivendo apenas com sua esperteza.' }
};

const ALIGNMENTS = {
    lb: { name: 'Leal/Bom', desc: 'Age com honra, compaixão e segue a lei.' },
    nb: { name: 'Neutro/Bom', desc: 'Faz o melhor que pode para ajudar os outros.' },
    cb: { name: 'Caótico/Bom', desc: 'Age conforme sua consciência, independente das leis.' },
    ln: { name: 'Leal/Neutro', desc: 'Age conforme a lei, tradição ou código pessoal.' },
    nn: { name: 'Neutro', desc: 'Afastado de dilemas morais; age com pragmatismo.' },
    cn: { name: 'Caótico/Neutro', desc: 'Segue seus caprichos; preza a liberdade individual.' },
    lm: { name: 'Leal/Mau', desc: 'Toma o que quer dentro dos limites de um código ou lei.' },
    nm: { name: 'Neutro/Mau', desc: 'Faz qualquer coisa para conseguir o que quer, sem escrúpulos.' },
    cm: { name: 'Caótico/Mau', desc: 'Age com violência impulsiva e sede de poder.' }
};

const SKILLS = [
    { id: 'acrobatics', name: 'Acrobacia', attr: 'des' },
    { id: 'athletics', name: 'Atletismo', attr: 'for' },
    { id: 'arcana', name: 'Arcanismo', attr: 'int' },
    { id: 'deception', name: 'Enganação', attr: 'car' },
    { id: 'stealth', name: 'Furtividade', attr: 'des' },
    { id: 'history', name: 'História', attr: 'int' },
    { id: 'intimidation', name: 'Intimidação', attr: 'car' },
    { id: 'insight', name: 'Intuição', attr: 'sab' },
    { id: 'investigation', name: 'Investigação', attr: 'int' },
    { id: 'medicine', name: 'Medicina', attr: 'sab' },
    { id: 'nature', name: 'Natureza', attr: 'int' },
    { id: 'perception', name: 'Percepção', attr: 'sab' },
    { id: 'persuasion', name: 'Persuasão', attr: 'car' },
    { id: 'sleight', name: 'Prestidigitação', attr: 'des' },
    { id: 'religion', name: 'Religião', attr: 'int' },
    { id: 'survival', name: 'Sobrevivência', attr: 'sab' },
    { id: 'animal', name: 'Adestrar Animais', attr: 'sab' },
    { id: 'performance', name: 'Atuação', attr: 'car' }
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const CONDITIONS = {
    // NEGATIVOS (9)
    blinded: { name: 'Cego', icon: '👁️', color: '#7f8c8d' },
    poisoned: { name: 'Envenenado', icon: '🤢', color: '#27ae60' },
    frightened: { name: 'Amedrontado', icon: '😨', color: '#6c5ce7' },
    restrained: { name: 'Imobilizado', icon: '⛓️', color: '#e17055' },
    paralyzed: { name: 'Paralisado', icon: '⚡', color: '#fdcb6e' },
    exhausted: { name: 'Exausto', icon: '🥱', color: '#d35400' },
    prone: { name: 'Caído', icon: '🛌', color: '#e67e22' },
    bleeding: { name: 'Sangrando', icon: '🩸', color: '#c0392b' },
    cursed: { name: 'Amaldiçoado', icon: '🧿', color: '#8e44ad' },

    // POSITIVOS (9)
    blessed: { name: 'Abençoado', icon: '✨', color: '#f1c40f' },
    hasted: { name: 'Acelerado', icon: '🏇', color: '#3498db' },
    invisible: { name: 'Invisível', icon: '👻', color: '#81ecec' },
    inspired: { name: 'Inspirado', icon: '💡', color: '#ffbe0b' },
    shielded: { name: 'Protegido', icon: '🛡️', color: '#2980b9' },
    enraged: { name: 'Fúria', icon: '💢', color: '#e74c3c' },
    regenerating: { name: 'Regenerando', icon: '🌿', color: '#2ecc71' },
    flying: { name: 'Voando', icon: '🦅', color: '#9b59b6' },
    heroic: { name: 'Heroico', icon: '🌟', color: '#f39c12' }
};

const GALLERY = [
    { name: 'Guerreiro Humano', url: 'https://img.freepik.com/premium-photo/human-male-fighter-character-fantasy-dnd-rpg-game_81048-2435.jpg' },
    { name: 'Maga Elfa', url: 'https://img.freepik.com/premium-photo/elf-female-wizard-character-fantasy-dnd-rpg-game_81048-2415.jpg' },
    { name: 'Anão Bárbaro', url: 'https://img.freepik.com/premium-photo/dwarf-male-barbarian-character-fantasy-dnd-rpg-game_81048-2422.jpg' },
    { name: 'Ladino Tiefling', url: 'https://img.freepik.com/premium-photo/tiefling-male-rogue-character-fantasy-dnd-rpg-game_81048-2441.jpg' },
    { name: 'Clériga Humana', url: 'https://img.freepik.com/premium-photo/human-female-cleric-character-fantasy-dnd-rpg-game_81048-2450.jpg' },
    { name: 'Paladino Meio-Orc', url: 'https://img.freepik.com/premium-photo/half-orc-male-paladin-character-fantasy-dnd-rpg-game_81048-2455.jpg' },
    { name: 'Bardo Halfling', url: 'https://img.freepik.com/premium-photo/halfling-male-bard-character-fantasy-dnd-rpg-game_81048-2460.jpg' },
    { name: 'Bruxa Gnomo', url: 'https://img.freepik.com/premium-photo/gnome-female-warlock-character-fantasy-dnd-rpg-game_81048-2465.jpg' }
];

const DND_5E_RULES = [
    // --- CATEGORIA: Batalha ---
    {
        id: 'iniciativa',
        title: 'Iniciativa & Fluxo de Batalha',
        category: 'battle',
        categoryName: 'Combate & Batalha',
        summary: 'Como organizar a ordem de turnos, rodadas e tempo.',
        content: `• <strong>Iniciativa:</strong> No início de um combate, cada participante faz um teste de Destreza (Iniciativa). O Mestre organiza os combatentes do maior resultado para o menor.<br>
• <strong>Rodada:</strong> Dura cerca de 6 segundos de tempo no jogo. Durante uma rodada, cada combatente realiza o seu turno.<br>
• <strong>Turno:</strong> No seu turno, você pode se <strong>mover</strong> e realizar uma <strong>ação principal</strong>. Você também pode fazer uma <strong>ação bônus</strong> (se tiver habilidades que a permitam) e uma <strong>reação</strong> por rodada (ex: Ataque de Oportunidade).`
    },
    {
        id: 'acoes-combate',
        title: 'Ações Disponíveis no Combate',
        category: 'battle',
        categoryName: 'Combate & Batalha',
        summary: 'Todas as ações que qualquer criatura pode fazer em seu turno.',
        content: `• <strong>Atacar:</strong> Realiza um ataque corpo a corpo ou à distância com suas armas.<br>
• <strong>Conjurar Magia:</strong> Lança uma magia com tempo de conjuração de 1 ação.<br>
• <strong>Disparar (Dash):</strong> Você ganha deslocamento extra igual ao seu deslocamento atual para o turno atual.<br>
• <strong>Desengajar (Disengage):</strong> Seu movimento não provoca ataques de oportunidade até o final do turno.<br>
• <strong>Esquivar (Dodge):</strong> Até o início do seu próximo turno, qualquer jogada de ataque contra você tem desvantagem (se você puder ver o atacante), e você tem vantagem em testes de salvaguarda de Destreza.<br>
• <strong>Ajudar (Help):</strong> Dá vantagem no teste de habilidade ou jogada de ataque de um aliado a até 1,5m de você.<br>
• <strong>Esconder-se (Hide):</strong> Faz um teste de Destreza (Furtividade) resistido pelo Percepção Passiva dos inimigos para ficar invisível/furtivo.<br>
• <strong>Preparar (Ready):</strong> Escolhe um gatilho perceptível e planeja uma ação para realizar como Reação quando o gatilho acontecer.<br>
• <strong>Usar Objeto:</strong> Interage com um segundo objeto no turno ou usa itens especiais que requerem uma ação (ex: beber poção ou aplicar veneno).`
    },
    {
        id: 'jogadas-ataque',
        title: 'Jogadas de Ataque & Cobertura',
        category: 'battle',
        categoryName: 'Combate & Batalha',
        summary: 'Como calcular acertos, críticos e o impacto de coberturas.',
        content: `• <strong>Jogada de Ataque:</strong> Rola d20 + Modificador de Atributo + Bônus de Proficiência (se proficiente). Se igualar ou superar a Classe de Armadura (CA) do alvo, o ataque acerta.<br>
• <strong>Acerto Crítico:</strong> Um resultado '20' natural no d20 sempre acerta e duplica os dados de dano do ataque (não os modificadores fixos).<br>
• <strong>Erro Crítico:</strong> Um resultado '1' natural no d20 sempre erra, independente dos bônus.<br>
• <strong>Cobertura Meia (Half Cover):</strong> +2 na CA e salvaguardas de Destreza.<br>
• <strong>Cobertura Três Quartos (3/4 Cover):</strong> +5 na CA e salvaguardas de Destreza.<br>
• <strong>Cobertura Total (Total Cover):</strong> A criatura não pode ser alvo direto de ataques ou magias, embora efeitos de área possam alcançá-la.`
    },
    {
        id: 'morte-estabilizacao',
        title: 'Pontos de Vida, Morte & Estabilização',
        category: 'battle',
        categoryName: 'Combate & Batalha',
        summary: 'Regras críticas para quando os personagens caem a 0 PV.',
        content: `• <strong>Cair a 0 PV:</strong> Se você for reduzido a 0 PV e não morrer instantaneamente (por dano massivo), você cai inconsciente.<br>
• <strong>Salvaguardas contra Morte (Death Saves):</strong> No início de cada um dos seus turnos a 0 PV, role um d20 sem modificadores:<br>
&nbsp;&nbsp;- <strong>10 ou mais:</strong> 1 Sucesso.<br>
&nbsp;&nbsp;- <strong>9 ou menos:</strong> 1 Falha.<br>
&nbsp;&nbsp;- <strong>20 Natural:</strong> Você recupera 1 PV instantaneamente e acorda.<br>
&nbsp;&nbsp;- <strong>1 Natural:</strong> Conta como 2 Falhas.<br>
&nbsp;&nbsp;- <strong>3 Sucessos:</strong> Você fica estável (permanece inconsciente com 0 PV, mas não precisa rolar mais salvaguardas).<br>
&nbsp;&nbsp;- <strong>3 Falhas:</strong> Você morre permanentemente.<br>
• <strong>Dano Massivo:</strong> Se o dano que sobrou após reduzir você a 0 PV for igual ou maior do que o seu PV Máximo, você morre instantaneamente.<br>
• <strong>Estabilizar um Companheiro:</strong> Uma criatura pode usar sua Ação para fazer um teste de Sabedoria (Medicina) CD 10 para estabilizar um aliado caído.`
    },
    {
        id: 'combate-especial',
        title: 'Combate Especial (Montado, Subaquático e Caído)',
        category: 'battle',
        categoryName: 'Combate & Batalha',
        summary: 'Situações e ambientes incomuns de combate.',
        content: `• <strong>Combate Caído (Prone):</strong> Uma criatura caída tem desvantagem em suas jogadas de ataque. Ataques contra ela têm vantagem se o atacante estiver a até 1,5 metro de distância; caso contrário, o ataque tem desvantagem.<br>
• <strong>Combate Montado:</strong> Uma montaria controlada age na iniciativa do cavaleiro, podendo apenas realizar as ações Disparar, Desengajar e Esquivar.<br>
• <strong>Combate Subaquático:</strong> Ataques com armas corpo a corpo têm desvantagem a menos que usem adaga, tridente, azagaia ou lança. Ataques à distância falham automaticamente além do alcance normal e têm desvantagem no alcance normal.`
    },

    // --- CATEGORIA: Aventura ---
    {
        id: 'descansos',
        title: 'Descanso Curto & Descanso Longo',
        category: 'adventure',
        categoryName: 'Aventura & Exploração',
        summary: 'Como recuperar pontos de vida, dados de vida e recursos.',
        content: `• <strong>Descanso Curto (Short Rest):</strong> Um período de pelo menos 1 hora de inatividade leve. Os personagens podem gastar um ou mais Dados de Vida (Hit Dice) para recuperar PV. Para cada Dado de Vida gasto, role-o e adicione o modificador de Constituição do personagem.<br>
• <strong>Descanso Longo (Long Rest):</strong> Um período de inatividade de pelo menos 8 horas (contendo pelo menos 6 horas de sono e no máximo 2 horas de atividade leve). Ao final, o personagem:<br>
&nbsp;&nbsp;- Recupera todos os seus Pontos de Vida (PV) perdidos.<br>
&nbsp;&nbsp;- Recupera metade do seu total máximo de Dados de Vida (Hit Dice) gastáveis.<br>
&nbsp;&nbsp;- Recupera todos os espaços de magia e recursos diários limitados.<br>
• <strong>Limitação:</strong> Um personagem não pode se beneficiar de mais de um Descanso Longo em um período de 24 horas.`
    },
    {
        id: 'visao-luz',
        title: 'Visão, Luz & Iluminação',
        category: 'adventure',
        categoryName: 'Aventura & Exploração',
        summary: 'Tipos de iluminação e as regras para enxergar no escuro.',
        content: `• <strong>Luz Plena (Bright Light):</strong> Permite que a maioria das criaturas enxergue normalmente.<br>
• <strong>Penumbra (Dim Light / Luz Fraca):</strong> Cria uma área levemente obscura. Criaturas têm desvantagem em testes de Sabedoria (Percepção) que dependam da visão nessa área.<br>
• <strong>Escuridão (Darkness):</strong> Cria uma área totalmente obscura. Criaturas sofrem efetivamente da condição Cego ao tentar ver coisas nessa área.<br>
• <strong>Visão no Escuro (Darkvision):</strong> Permite enxergar na penumbra como se fosse luz plena, e na escuridão como se fosse penumbra (apenas em tons de cinza).`
    },
    {
        id: 'queda-livre',
        title: 'Queda Livre & Danos de Impacto',
        category: 'adventure',
        categoryName: 'Aventura & Exploração',
        summary: 'O perigo das alturas e rolagens de dano por queda.',
        content: `• <strong>Dano por Queda:</strong> Uma criatura que cai de uma altura sofre <strong>1d6 de dano de concussão para cada 3 metros</strong> (10 feet) de queda livre, até o limite máximo de <strong>20d6</strong>.<br>
• <strong>Estado Caído:</strong> A criatura que sofreu dano por queda cai no chão e assume a condição **Caído** (Prone) ao término do impacto.`
    },
    {
        id: 'asfixia',
        title: 'Sufocamento & Apneia',
        category: 'adventure',
        categoryName: 'Aventura & Exploração',
        summary: 'Quanto tempo uma criatura aguenta sem respirar antes de morrer.',
        content: `• <strong>Prender a Respiração:</strong> Uma criatura pode prender a respiração por um tempo igual a <strong>1 + modificador de Constituição minutos</strong> (mínimo de 30 segundos).<br>
• <strong>Sufocamento:</strong> Quando a respiração acaba, a criatura aguenta sobreviver por um número de rodadas igual ao seu **modificador de Constituição** (mínimo de 1 rodada). No início do seu próximo turno, ela cai a **0 PV** e começa a realizar salvaguardas contra a morte, não podendo ser curada ou estabilizada até que consiga respirar novamente.`
    },
    {
        id: 'viagem-ritmo',
        title: 'Ritmo de Viagem & Exploração',
        category: 'adventure',
        categoryName: 'Aventura & Exploração',
        summary: 'Diferenças de velocidade e efeitos na percepção passiva.',
        content: `• <strong>Ritmo Rápido (Fast):</strong> Cobre 6 km/hora. Sofre penalidade de **-5 em Percepção Passiva** para notar ameaças ou emboscadas.<br>
• <strong>Ritmo Normal (Normal):</strong> Cobre 4,5 km/hora. Viagem padrão sem modificadores negativos.<br>
• <strong>Ritmo Lento (Slow):</strong> Cobre 3 km/hour. Permite que o grupo viaje de forma **Furtiva** e observe o ambiente cuidadosamente.`
    },

    // --- CATEGORIA: Habilidades ---
    {
        id: 'testes-habilidade',
        title: 'Testes de Habilidade (Ability Checks)',
        category: 'actions',
        categoryName: 'Habilidades & Ações',
        summary: 'Como rolar e interpretar os testes e dificuldades de D&D 5e.',
        content: `• <strong>Fórmula Geral:</strong> Rola d20 + Modificador de Atributo + Bônus de Proficiência (se proficiente em uma perícia aplicável).<br>
• <strong>Classes de Dificuldade (CD):</strong> Definida pelo Mestre para cada desafio:<br>
&nbsp;&nbsp;- <strong>Muito Fácil:</strong> CD 5<br>
&nbsp;&nbsp;- <strong>Fácil:</strong> CD 10<br>
&nbsp;&nbsp;- <strong>Médio:</strong> CD 15<br>
&nbsp;&nbsp;- <strong>Difícil:</strong> CD 20<br>
&nbsp;&nbsp;- <strong>Muito Difícil:</strong> CD 25<br>
&nbsp;&nbsp;- <strong>Quase Impossível:</strong> CD 30<br>
• <strong>Testes Resistidos (Contests):</strong> Quando duas criaturas agem uma contra a outra (ex: Atletismo para agarrar contra Acrobacia para escapar). Aquele que obtiver o maior resultado vence a disputa.`
    },
    {
        id: 'vantagem-desvantagem',
        title: 'Vantagem & Desvantagem',
        category: 'actions',
        categoryName: 'Habilidades & Ações',
        summary: 'A principal mecânica de modificadores do D&D 5ª Edição.',
        content: `• <strong>Vantagem (Advantage):</strong> Rola <strong>dois d20</strong> e usa o **maior** resultado.<br>
• <strong>Desvantagem (Disadvantage):</strong> Rola <strong>dois d20</strong> e usa o **menor** resultado.<br>
• <strong>Anulação:</strong> Se múltiplas fontes de vantagem e desvantagem afetarem a mesma jogada, elas se anulam completamente. Você rola apenas um d20 normal, não importa quantas vantagens ou desvantagens tenha acumulado.`
    },
    {
        id: 'pericias-resumo',
        title: 'Guia Rápido de Perícias',
        category: 'actions',
        categoryName: 'Habilidades & Ações',
        summary: 'Lista de perícias de D&D 5e e qual atributo elas usam.',
        content: `• <strong>Força:</strong> Atletismo (correr, escalar, nadar, agarrar).<br>
• <strong>Destreza:</strong> Acrobacia (equilíbrio, acrobacias), Furtividade (esconder-se), Prestidigitação (truques manuais, roubo).<br>
• <strong>Inteligência:</strong> Arcanismo (magias, planos), História (fatos passados, reinos), Investigação (dedução, pistas), Natureza (plantas, clima, animais selvagens), Religião (divindades, ritos).<br>
• <strong>Sabedoria:</strong> Adestrar Animais (acalmar feras), Intuição (detectar mentiras), Medicina (tratar feridas), Percepção (ouvir e ver o ambiente), Sobrevivência (rastrear, caçar, guiar).<br>
• <strong>Carisma:</strong> Atuação (apresentações), Enganação (mentir, disfarçar), Intimidação (ameaçar), Persuasão (convencer com diplomacia).`
    },
    // --- CATEGORIA: Mecânicas da Ficha ---
    {
        id: 'calc-modificadores',
        title: 'Modificadores de Atributo',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'Como converter o valor de um atributo (ex: Força 15) em um modificador.',
        content: `• O <strong>Modificador de Atributo</strong> dita o bônus ou penalidade em jogadas de dado.<br>
• <strong>Fórmula:</strong> <code>(Valor do Atributo - 10) ÷ 2</code> (arredondado para baixo).<br>
• Exemplos Práticos:<br>
&nbsp;&nbsp;- Valor 8 ou 9 = -1<br>
&nbsp;&nbsp;- Valor 10 ou 11 = +0<br>
&nbsp;&nbsp;- Valor 12 ou 13 = +1<br>
&nbsp;&nbsp;- Valor 14 ou 15 = +2<br>
&nbsp;&nbsp;- Valor 16 ou 17 = +3<br>
&nbsp;&nbsp;- Valor 18 ou 19 = +4<br>
&nbsp;&nbsp;- Valor 20 = +5`
    },
    {
        id: 'calc-proficiencia',
        title: 'Bônus de Proficiência',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'O bônus que representa o treinamento geral e experiência do personagem.',
        content: `• O <strong>Bônus de Proficiência</strong> escala de acordo com o Nível Total do personagem.<br>
• Ele é adicionado a testes de atributo, testes de resistência (saves) e jogadas de ataque com armas ou ferramentas em que o personagem é proficiente.<br>
• <strong>Fórmula Escalar:</strong><br>
&nbsp;&nbsp;- Nível 1 a 4: <strong>+2</strong><br>
&nbsp;&nbsp;- Nível 5 a 8: <strong>+3</strong><br>
&nbsp;&nbsp;- Nível 9 a 12: <strong>+4</strong><br>
&nbsp;&nbsp;- Nível 13 a 16: <strong>+5</strong><br>
&nbsp;&nbsp;- Nível 17 a 20: <strong>+6</strong><br>
• O bônus <strong>nunca</strong> é adicionado ao dano, apenas a jogadas de d20 para tentar um sucesso.`
    },
    {
        id: 'calc-ca',
        title: 'Classe de Armadura (CA)',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'Como é calculada a defesa (Classe de Armadura) de uma criatura.',
        content: `• A <strong>CA (Classe de Armadura)</strong> determina a dificuldade de acertar um ataque físico ou à distância contra o personagem.<br>
• <strong>Sem Armadura:</strong> <code>10 + Modificador de Destreza</code>.<br>
• <strong>Armadura Leve:</strong> <code>CA Base da Armadura + Modificador de Destreza</code>.<br>
• <strong>Armadura Média:</strong> <code>CA Base da Armadura + Modificador de Destreza (máximo de +2)</code>.<br>
• <strong>Armadura Pesada:</strong> <code>CA Base da Armadura</code> (Ignora modificador de destreza, e pode exigir Força mínima).<br>
• <strong>Escudos:</strong> Qualquer escudo equipado concede <strong>+2</strong> na CA (não cumulativo com múltiplos escudos).`
    },
    {
        id: 'calc-iniciativa',
        title: 'Iniciativa',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'O cálculo base para o turno na ordem de batalha.',
        content: `• A <strong>Iniciativa</strong> é simplesmente um teste de Destreza.<br>
• <strong>Valor Passivo na Ficha:</strong> O bônus exibido na ficha é exatamente igual ao <strong>Modificador de Destreza</strong> do personagem.<br>
• Quando o combate se inicia, o jogador rola <code>1d20 + Iniciativa</code>.`
    },
    {
        id: 'calc-dadosvida',
        title: 'Dados de Vida & PV Máximo',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'Como se define a vida e a capacidade de se curar nos descansos.',
        content: `• <strong>Dados de Vida (Hit Dice):</strong> O personagem possui uma quantidade de Dados de Vida igual ao seu <strong>Nível</strong>. O tipo do dado (d6, d8, d10, d12) é definido pela sua <strong>Classe</strong>.<br>
• <strong>PV no Nível 1:</strong> <code>Valor máximo do Dado de Vida + Modificador de Constituição</code>.<br>
• <strong>PV em Níveis Subsequentes:</strong> Ao subir de nível, você rola seu Dado de Vida (ou pega a média arredondada para cima) e soma seu <strong>Modificador de Constituição</strong> para aumentar seu PV Máximo.`
    },
    {
        id: 'calc-pericias',
        title: 'Total de Perícias & Salvaguardas',
        category: 'mechanics',
        categoryName: 'Mecânicas da Ficha',
        summary: 'A lógica de soma de habilidades.',
        content: `• Os bônus na aba de perícias e resistências (saves) seguem a regra:<br>
• <strong>Sem Proficiência:</strong> Apenas o <code>Modificador do Atributo correspondente</code>.<br>
• <strong>Com Proficiência:</strong> <code>Modificador do Atributo + Bônus de Proficiência</code>.<br>
• <strong>Expertise (Especialização):</strong> Algumas classes (como Ladino e Bardo) permitem dobrar o Bônus de Proficiência em perícias específicas.`
    }
];
