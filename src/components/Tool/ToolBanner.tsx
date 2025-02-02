import { Button, Title, useMantineTheme } from '@mantine/core';
import { ToolType } from '@prisma/client';
import { IconBrush, IconExternalLink } from '@tabler/icons-react';
import { getEdgeUrl } from '~/client-utils/cf-images-utils';
import { EdgeMedia } from '~/components/EdgeMedia/EdgeMedia';
import { useImageFilters } from '~/components/Image/image.utils';
import { CustomMarkdown } from '~/components/Markdown/CustomMarkdown';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { FilterKeys } from '~/providers/FiltersProvider';
import { generationPanel, generationStore } from '~/store/generation.store';
import { slugit } from '~/utils/string-helpers';
import { trpc } from '~/utils/trpc';

export function ToolBanner({
  filterType = 'images',
  slug,
}: {
  filterType?: FilterKeys<'images' | 'videos'>;
  slug?: string;
}) {
  const { tools: toolIds } = useImageFilters(filterType);
  const selectedId = toolIds?.[0];

  const { data } = trpc.tool.getAll.useQuery(undefined, { enabled: !!toolIds?.length || !!slug });
  const selected = data?.find((x) => x.id === selectedId || slugit(x.name) === slug);
  const theme = useMantineTheme();

  if (!data || !selected) return null;

  const hasHeader = !!selected.metadata?.header;

  return (
    <div
      className="relative -mt-4 mb-4 overflow-hidden bg-gray-1 dark:bg-dark-9"
      style={hasHeader ? { color: theme.white } : undefined}
    >
      <MasonryContainer
        style={
          hasHeader
            ? {
                backgroundImage: `url(${getEdgeUrl(selected.metadata.header as string, {
                  original: true,
                })})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backgroundBlendMode: 'darken',
              }
            : undefined
        }
      >
        <div className="flex h-full max-w-md flex-col gap-2 py-6">
          <div className="flex justify-between gap-3">
            <div className="flex flex-col gap-2">
              {selected.icon && <EdgeMedia width={120} src={selected.icon} />}
              <div className="flex items-center gap-8">
                <Title order={2} className="font-semibold">
                  {selected.name}
                </Title>
                {/* {/* {selected.domain && (
                  <Button
                    color="blue"
                    radius="xl"
                    target="_blank"
                    rightIcon={<IconExternalLink size={18} />}
                    component="a"
                    href={selected.domain}
                    rel="nofollow noreferrer"
                  >
                    Visit
                  </Button>
                )} */}
                {selected.supported && (
                  <Button
                    color="blue"
                    radius="xl"
                    rightIcon={<IconBrush size={18} />}
                    onClick={() => {
                      const isVideo = selected.type === ToolType.Video;
                      generationStore.setData({
                        resources: [],
                        params: {},
                        type: isVideo ? 'video' : 'image',
                        // TODO.gen: have to think this through on how to get the right workflow
                        workflow: isVideo ? `${selected.name.toLowerCase}-txt2vid` : undefined,
                      });
                      generationPanel.open();
                    }}
                  >
                    Generate
                  </Button>
                )}
              </div>
            </div>
          </div>
          {selected.description && (
            <CustomMarkdown
              allowedElements={['a']}
              className="markdown-content text-shadow-default"
              unwrapDisallowed
            >
              {selected.description}
            </CustomMarkdown>
          )}
        </div>
      </MasonryContainer>
    </div>
  );
}
