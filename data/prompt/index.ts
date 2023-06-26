type dbml = string
export const GET_QUERY = (sql:dbml) =>`作为一个数据库模型业务分析专家，您需要根据当前数据库模型(DBML格式)生成对应的 MySQL 数据库可执行的 SQL 文本，并列出执行该 SQL 所需的变量及其解释，最后为此条查询命名。当前数据库模型为：

\`\`\`dbml
${sql}
\`\`\`

请您使用以下模版格式输出结果（注意模版中的标签和变量名称是必须存在的）：

=======模版开始=======

根据您提供的数据库模型，已为您生成查询:
<sql> &=&sql&=& </sql>

执行所需变量:

判断解决当前问题的查询执行时是否需要变量。若条件成立，请使用：
<var>执行 SQL 所需变量名称</var>
<varDescription>变量解释</varDescription>

若不需要变量，则无需提供任何信息。

查询命名和描述:
<queryName> &=& 查询名称 &=& </queryName>
<queryDescription> &=& 查询描述 &=& </queryDescription>

=======模版结束=======

请您仅替换模版中的 &=& 和 &=& 之间的文字，变量命名请放在 $ 和 $ 之间,并且保持模版排版一致。例如：

根据您提供的数据库模型，已为您生成查询:
<sql>
SELECT $field$ FROM users where id=$id$;
INSERT INTO users (email, name) VALUES ($email$, $name$);
</sql>

执行所需变量:

<var> $field$ </var>: <varDescription> users 表中的某个字段。</varDescription>

查询命名和描述:
<queryName> 查用户和插入用户 </queryName>
<queryDescription> 先根据用户id查出用户,然后插入一个用户。 </queryDescription>
`
export const GET_SCHEMA_INFO = (sql:dbml) =>`作为一个数据模型业务分析专家，您需要根据当前数据模型(DBML格式)进行精确的分析,根据模型的提供的信息，分析该模型并输出简要描述。当前数据库模型为：
<dbml>
${sql}
</dbml>
`
export const ADD_TABLE = (sql:dbml)=>`作为一位资深的业务分析的专家，你需要结合当前数据库模型(DBML格式)并精确地分析我需要在当前数据库模型新增加的业务需求，向当前数据库模型添加(DBML格式)新表或者修改表字段之间的关联关系。当前数据库模型为：
<dbml>
${sql}
</dbml>

请您使用以下模版格式输出结果 (输出格式:XML,注意:XMl标签需要保留。dbml文本为新的模型)

=======模版开始=======

根据您提供的业务需求和数据库模型，已为您生成新的DBML数据库模型:

<dbml>
{{dbml文本}}
</dbml>

已经为你生成:<tableName>{{表名}}</tableName> <tableName>{{表名}}</tableName>
<field>{{表名}}:{{字段}}</field>:<description>{{表的字段描述}}</description>

=======模版结束=======

请您仅替换模版中的{{和}}之间的文字，并且保持模版排版一致。例如下面这个输出案例:

根据您提供的业务需求和数据库模型，已为您生成新的DBML数据库模型:

<dbml>Table ecommerce.merchants {
  id int
  country_code int
  merchant_name varchar
  "created at" varchar
  admin_id int [ref: > U.id]
}

// If schema name is omitted, it will default to "public" schema.
Table users as U {
  id int [pk, increment] // auto-increment
  full_name varchar
}</dbml>

已经为你生成:<tableName>users</tableName>
<field>product_tags.id</field>:<description>主键</description>
<field>full_name</field>:<description>姓名</description>`

export const ADD_SCHEMA=()=>`你作为一个擅长业务分析的数据库模型建表专家，您需要分析我的业务需求并且输出 DBML格式 的数据库模型，添加一个或多个表和新增的表字段之间的关联关系。
请您使用以下模版格式输出结果 (输出格式:XML,注意:XMl标签需要保留)

=======模版开始=======

根据您提供的业务需求和数据库模型，已为您生成新的DBML数据库模型:

<modelName>该模型名称</modelName>

<dbml>{{dbml文本}}</dbml>

已经为你生成:<tableName>{{表名}}</tableName> <tableName>{{表名}}</tableName>

=======模版结束=======

请您仅替换模版中的{{和}}之间的文字，并且保持模版排版一致。例如输出:

根据您提供的业务需求和数据库模型，已为您生成新的DBML数据库模型:

<modelName>电子商务</modelName>

<dbml>Table ecommerce.merchants {
  id int
  country_code int
  merchant_name varchar
  "created at" varchar
  admin_id int [ref: > U.id]
}

// If schema name is omitted, it will default to "public" schema.
Table users as U {
  id int [pk, increment] // auto-increment
  full_name varchar
  created_at timestamp
  country_code int
}</dbml>

已经为你生成:<tableName>merchants</tableName> <tableName>users</tableName>
`