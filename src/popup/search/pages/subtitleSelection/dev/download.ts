import {getFormatFromFilename} from "@/subtitle/util";
import {SubtitleFormat} from "@/subtitle/state/types";
import { SearchQueryResultEntry as  SearchQueryResultForSeriesEntry} from './searchQueryForSeries';
import { SearchQueryResultEntry as  SearchQueryResultForMoviesEntry } from './searchQueryForMovies';

export const download = async (entry: SearchQueryResultForSeriesEntry | SearchQueryResultForMoviesEntry): Promise<{ raw: string, format: SubtitleFormat }> => {
  const formatArgument = getFormatFromFilename(entry.attributes.files[0].file_name ?? '') ? {} : {sub_format: 'webvtt'};

  const { file_name, link } = await fetch('https://api.opensubtitles.com/api/v1/download', {
    method: 'POST',
    body: JSON.stringify({ file_id: entry.attributes.files[0].file_id, ...formatArgument }),
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Api-Key': 'Th2A6DhpAl1kshBZlLqwwfZZd0i7p7Hn'
    }
  })
    .then((r) => r.json());

  const raw = await fetch(link).then((r) => r.text());

  const format = getFormatFromFilename(file_name);
  if(!format){
    return Promise.reject(`${format} is not supported`);
  }

  return {
    raw,
    format
  };
};
