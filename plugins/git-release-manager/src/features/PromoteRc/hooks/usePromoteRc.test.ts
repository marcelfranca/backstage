/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';

import {
  mockApiClient,
  mockCalverProject,
  mockReleaseCandidateCalver,
  mockUser,
} from '../../../test-helpers/test-helpers';
import { usePromoteRc } from './usePromoteRc';

jest.mock('@backstage/core', () => ({
  useApi: () => mockApiClient,
  createApiRef: jest.fn(),
}));
jest.mock('../../../contexts/ProjectContext', () => ({
  useProjectContext: () => ({
    project: mockCalverProject,
  }),
}));
jest.mock('../../../contexts/UserContext', () => ({
  useUserContext: () => ({ user: mockUser }),
}));

describe('usePromoteRc', () => {
  beforeEach(jest.clearAllMocks);

  it('should return the expected responseSteps and progress', async () => {
    const { result } = renderHook(() =>
      usePromoteRc({
        rcRelease: mockReleaseCandidateCalver,
        releaseVersion: 'version-1.2.3',
      }),
    );

    await act(async () => {
      await waitFor(() => result.current.run());
    });

    expect(result.error).toEqual(undefined);
    expect(result.current.responseSteps).toHaveLength(4);
  });

  it('should return the expected responseSteps and progress (with successCb)', async () => {
    const { result } = renderHook(() =>
      usePromoteRc({
        rcRelease: mockReleaseCandidateCalver,
        releaseVersion: 'version-1.2.3',
        successCb: jest.fn(),
      }),
    );

    await act(async () => {
      await waitFor(() => result.current.run());
    });

    expect(result.current.responseSteps).toHaveLength(5);
    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "progress": 100,
        "responseSteps": Array [
          Object {
            "message": "Fetched most recent commit from release branch",
            "secondaryMessage": "with sha \\"latestCommit.sha\\"",
          },
          Object {
            "message": "Created Tag Object",
            "secondaryMessage": "with sha \\"mock_tag_object_sha\\"",
          },
          Object {
            "message": "Create Tag Reference",
            "secondaryMessage": "with ref \\"mock_createRef_ref\\"",
          },
          Object {
            "link": "mock_release_html_url",
            "message": "Promoted \\"mock_release_name\\"",
            "secondaryMessage": "from \\"rc-2020.01.01_1\\" to \\"mock_release_tag_name\\"",
          },
          Object {
            "icon": "success",
            "message": "Success callback successfully called 🚀",
          },
        ],
        "run": [Function],
        "runInvoked": true,
      }
    `);
  });
});
