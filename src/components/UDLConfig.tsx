import { UdlForm } from "./UDLForm";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetTitle, SheetHeader, SheetContent } from "./ui/sheet";

interface UDLConfigProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: Record<string, any>;
  onSubmit: (udlConfig: any) => void;
}

export function UDLConfig({ isOpen, onOpenChange, initialValues, onSubmit }: UDLConfigProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
      modal={true}
    >
      <SheetContent
        side="bottom"
        className="max-w-full"
      >
        <SheetHeader className="max-w-screen-sm mx-auto">
          <SheetTitle className='min-w-full '>
            <div className="text-left">
              UDL Configuration
            </div>
            {/* {selectedItem?.settings.label && <> - <code>{selectedItem?.settings.label}</code></>} */}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[60vh] w-full pr-4 overflow-y-auto">
          <div className="mx-auto max-w-screen-sm">
            <UdlForm
              initialValues={initialValues}
              onSubmit={(udlConfig) => {
                onSubmit(udlConfig);
                onOpenChange(false);
              }}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}