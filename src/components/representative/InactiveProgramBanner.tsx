import { AlertTriangle } from "lucide-react";

export const InactiveProgramBanner = () => {
  return (
    <div className="bg-warning/10 border-2 border-warning rounded-lg p-6 mb-8">
      <div className="flex items-start gap-4">
        <AlertTriangle className="h-8 w-8 text-warning flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            ⚠️ ATENÇÃO: Programa Temporariamente Inativo
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            No momento, <strong>não estamos realizando processos seletivos ativos</strong> para novos representantes. 
            No entanto, você pode preencher o formulário abaixo para manifestar seu interesse. Quando o programa 
            for reativado, entraremos em contato com todos os interessados cadastrados.
          </p>
        </div>
      </div>
    </div>
  );
};
